import type { UserWithRole } from '../../../domain/entities/userEntity.js'
import type { UserResponseDto } from '../dtos/authDto.js'

export class UserMapper {
  static toDto(user: UserWithRole): UserResponseDto {
    return {
      id:        user.id,
      email:     user.email,
      firstName: user.firstName,
      lastName:  user.lastName,
      roleId:    user.roleId,
      roleName:  user.role.name,
      companyId: user.companyId,
      branchId:  user.branchId,
    }
  }
}
