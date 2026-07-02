import type { IServiceItemRepository } from '../../../domain/repositories/iServiceItemRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { ServiceItemMapper } from '../../../interfaces/http/mappers/serviceItemMapper.js'
import type { ServiceItemResponseDto } from '../../../interfaces/http/dtos/serviceItemDto.js'

export class GetServiceItemUseCase {
  constructor(private readonly serviceItemRepository: IServiceItemRepository) {}

  async execute(id: string): Promise<ServiceItemResponseDto> {
    const item = await this.serviceItemRepository.findById(id)
    if (!item) throw new AppError(404, ERROR_MESSAGES.SERVICE_ITEM.NOT_FOUND)
    return ServiceItemMapper.toDto(item)
  }
}
