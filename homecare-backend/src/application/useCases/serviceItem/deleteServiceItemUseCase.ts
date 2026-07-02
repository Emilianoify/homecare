import type { IServiceItemRepository } from '../../../domain/repositories/iServiceItemRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

export class DeleteServiceItemUseCase {
  constructor(private readonly serviceItemRepository: IServiceItemRepository) {}

  async execute(id: string): Promise<void> {
    const item = await this.serviceItemRepository.findById(id)
    if (!item) throw new AppError(404, ERROR_MESSAGES.SERVICE_ITEM.NOT_FOUND)
    await this.serviceItemRepository.softDelete(id)
  }
}
