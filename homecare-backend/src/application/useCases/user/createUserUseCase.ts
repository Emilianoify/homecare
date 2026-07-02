import argon2 from 'argon2'
import type { IUserManagementRepository } from '../../../domain/repositories/iUserManagementRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { UserManagementMapper } from '../../../interfaces/http/mappers/userManagementMapper.js'
import type { CreateUserDto } from '../../../interfaces/http/schemas/userSchema.js'
import type { UserResponseDto } from '../../../interfaces/http/dtos/userDto.js'

export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserManagementRepository) {}

  async execute(dto: CreateUserDto, companyId: string): Promise<UserResponseDto> {
    const existing = await this.userRepository.findByEmail(dto.email)
    if (existing) throw new AppError(409, ERROR_MESSAGES.USER.EMAIL_EXISTS)

    const passwordHash = await argon2.hash(dto.password, {
      type:        argon2.argon2id,
      memoryCost:  65536,
      timeCost:    3,
      parallelism: 4,
    })

    const user = await this.userRepository.create({
      companyId,
      email:     dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName:  dto.lastName,
      roleId:    dto.roleId,
      branchId:  dto.branchId,
      active:    dto.active,
    })

    return UserManagementMapper.toDto(user)
  }
}
