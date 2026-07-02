import type { IUserManagementRepository } from '../../../domain/repositories/iUserManagementRepository.js'
import { UserManagementMapper } from '../../../interfaces/http/mappers/userManagementMapper.js'
import type { UserQuery } from '../../../interfaces/http/schemas/userSchema.js'
import type { UserListResultDto } from '../../../interfaces/http/dtos/userDto.js'

export class ListUsersUseCase {
  constructor(private readonly userRepository: IUserManagementRepository) {}

  async execute(query: UserQuery, companyId: string): Promise<UserListResultDto> {
    const { items, total } = await this.userRepository.findAll({ ...query, companyId })

    return {
      items:      items.map(item => UserManagementMapper.toDto(item)),
      page:       query.page,
      limit:      query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    }
  }
}
