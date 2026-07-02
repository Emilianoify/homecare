import type { IUserManagementRepository } from '../../../domain/repositories/iUserManagementRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { UserManagementMapper } from '../../../interfaces/http/mappers/userManagementMapper.js'
import type { UserResponseDto } from '../../../interfaces/http/dtos/userDto.js'

export class GetUserUseCase {
  constructor(private readonly userRepository: IUserManagementRepository) {}

  async execute(id: string, companyId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id, companyId)
    if (!user) throw new AppError(404, ERROR_MESSAGES.USER.NOT_FOUND)
    return UserManagementMapper.toDto(user)
  }
}
