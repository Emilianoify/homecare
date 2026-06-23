import jwt from 'jsonwebtoken'
import { env } from '../../../infrastructure/config/env.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import type { IUserRepository } from '../../../domain/repositories/iUserRepository.js'

interface TokenPair {
  accessToken:  string
  refreshToken: string
}

export class RefreshTokenUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(token: string): Promise<TokenPair> {
    const stored = await this.userRepository.findRefreshToken(token)

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new AppError(401, ERROR_MESSAGES.AUTH.INVALID_REFRESH)
    }

    await this.userRepository.revokeRefreshTokenById(stored.id)

    const user = await this.userRepository.findById(stored.userId)
    if (!user) throw new AppError(401, ERROR_MESSAGES.AUTH.INVALID_REFRESH)

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
      { userId: user.id, nonce: Math.random() },
      env.JWT_SECRET,
      { expiresIn: env.REFRESH_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'] }
    )

    await this.userRepository.createRefreshToken({
      userId:    user.id,
      token:     refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    return { accessToken, refreshToken }
  }
}
