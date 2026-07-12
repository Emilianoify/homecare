import type { IUserManagementRepository } from '../../../domain/repositories/iUserManagementRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { UserManagementMapper } from '../../../interfaces/http/mappers/userManagementMapper.js'
import type { UpdateUserDto } from '../../../interfaces/http/schemas/userSchema.js'
import type { UserResponseDto } from '../../../interfaces/http/dtos/userDto.js'

export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserManagementRepository) {}

  async execute(id: string, dto: UpdateUserDto, companyId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id, companyId)
    if (!user) throw new AppError(404, ERROR_MESSAGES.USER.NOT_FOUND)

    // Si se cambia el rol, el nuevo roleId debe pertenecer a la company
    // del caller (evita asignar un rol de otra organización).
    if (dto.roleId !== undefined) {
      const roleOk = await this.userRepository.roleBelongsToCompany(dto.roleId, companyId)
      if (!roleOk) throw new AppError(400, ERROR_MESSAGES.USER.INVALID_ROLE)
    }

    const updated = await this.userRepository.update(id, {
      firstName: dto.firstName,
      lastName:  dto.lastName,
      roleId:    dto.roleId,
      branchId:  dto.branchId,
      active:    dto.active,
    })

    return UserManagementMapper.toDto(updated)
  }
}
