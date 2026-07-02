import type { IUserManagementRepository } from '../../../domain/repositories/iUserManagementRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserManagementRepository) {}

  async execute(id: string, companyId: string, requestingUserId: string): Promise<void> {
    // Un usuario no puede eliminarse a sí mismo
    if (id === requestingUserId) {
      throw new AppError(400, ERROR_MESSAGES.USER.CANNOT_DELETE_SELF)
    }

    const user = await this.userRepository.findById(id, companyId)
    if (!user) throw new AppError(404, ERROR_MESSAGES.USER.NOT_FOUND)

    await this.userRepository.softDelete(id)
  }
}
