import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'node:crypto'
import { env } from '../../../infrastructure/config/env.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { UserMapper } from '../../../interfaces/http/mappers/userMapper.js'
import type { IUserRepository } from '../../../domain/repositories/iUserRepository.js'
import type { LoginDto } from '../../../interfaces/http/schemas/authSchema.js'
import type { UserResponseDto } from '../../../interfaces/http/dtos/authDto.js'

interface LoginResult {
  user:         UserResponseDto
  accessToken:  string
  refreshToken: string
}

// Hash argon2id de un valor descartable. Cuando el email no existe o el
// usuario está inactivo se verifica contra este hash para que todas las
// ramas de fallo tarden lo mismo — sin esto, el tiempo de respuesta revela
// qué emails existen (enumeración de cuentas).
const DUMMY_HASH_PROMISE = argon2.hash('timing-equalizer', {
  type:        argon2.argon2id,
  memoryCost:  65536,
  timeCost:    3,
  parallelism: 4,
})

export class LoginUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: LoginDto): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(dto.email)

    if (!user || !user.active) {
      await argon2.verify(await DUMMY_HASH_PROMISE, dto.password)
      throw new AppError(401, ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS)
    }

    const valid = await argon2.verify(user.passwordHash, dto.password)
    if (!valid) {
      throw new AppError(401, ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS)
    }

    const payload = {
      userId:    user.id,
      roleId:    user.roleId,
      companyId: user.companyId,
      ...(user.branchId && { branchId: user.branchId }),
    }

    const accessToken = jwt.sign(
      payload,
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRY as jwt.SignOptions['expiresIn'] }
    )

    const refreshToken = jwt.sign(
      { userId: user.id, nonce: randomUUID() },
      env.JWT_SECRET,
      { expiresIn: env.REFRESH_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'] }
    )

    await this.userRepository.createRefreshToken({
      userId:    user.id,
      token:     refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    return { user: UserMapper.toDto(user), accessToken, refreshToken }
  }
}
