import argon2 from 'argon2'
import type { IUserManagementRepository } from '../../../domain/repositories/iUserManagementRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import type { ChangePasswordDto } from '../../../interfaces/http/schemas/userSchema.js'

export class ChangePasswordUseCase {
  constructor(private readonly userRepository: IUserManagementRepository) {}

  async execute(id: string, dto: ChangePasswordDto, companyId: string): Promise<void> {
    const user = await this.userRepository.findById(id, companyId)
    if (!user) throw new AppError(404, ERROR_MESSAGES.USER.NOT_FOUND)

    const valid = await argon2.verify(user.passwordHash, dto.currentPassword)
    if (!valid) throw new AppError(400, ERROR_MESSAGES.USER.INVALID_PASSWORD)

    const newHash = await argon2.hash(dto.newPassword, {
      type:        argon2.argon2id,
      memoryCost:  65536,
      timeCost:    3,
      parallelism: 4,
    })

    await this.userRepository.updatePassword(id, newHash)
  }
}
