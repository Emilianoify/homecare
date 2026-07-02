import type { UserWithRole } from '../../../domain/entities/userEntity.js'
import type { UserResponseDto } from '../dtos/userDto.js'

export class UserManagementMapper {
  static toDto(user: UserWithRole): UserResponseDto {
    return {
      id:        user.id,
      companyId: user.companyId,
      branchId:  user.branchId,
      roleId:    user.roleId,
      roleName:  user.role.name,
      email:     user.email,
      firstName: user.firstName,
      lastName:  user.lastName,
      fullName:  `${user.lastName}, ${user.firstName}`,
      active:    user.active,
      createdAt: user.createdAt.toISOString(),
    }
  }
}
