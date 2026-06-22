import argon2 from 'argon2'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { UserMapper } from '../../../interfaces/http/mappers/userMapper.js'
import type { IUserRepository } from '../../../domain/repositories/iUserRepository.js'
import type { RegisterDto } from '../../../interfaces/http/schemas/authSchema.js'
import type { UserResponseDto } from '../../../interfaces/http/dtos/authDto.js'

export class RegisterUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: RegisterDto): Promise<UserResponseDto> {
    const existing = await this.userRepository.findByEmail(dto.email)
    if (existing) throw new AppError(409, ERROR_MESSAGES.AUTH.EMAIL_EXISTS)

    const passwordHash = await argon2.hash(dto.password, {
      type:        argon2.argon2id,
      memoryCost:  65536,
      timeCost:    3,
      parallelism: 4,
    })

    const user = await this.userRepository.create({
      email:     dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName:  dto.lastName,
      roleId:    dto.roleId,
      companyId: dto.companyId,
      branchId:  dto.branchId,
    })

    return UserMapper.toDto(user)
  }
}
