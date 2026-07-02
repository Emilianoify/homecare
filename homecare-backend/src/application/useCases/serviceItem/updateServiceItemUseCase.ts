import type { IServiceItemRepository } from '../../../domain/repositories/iServiceItemRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { ServiceItemMapper } from '../../../interfaces/http/mappers/serviceItemMapper.js'
import type { UpdateServiceItemDto } from '../../../interfaces/http/schemas/serviceItemSchema.js'
import type { ServiceItemResponseDto } from '../../../interfaces/http/dtos/serviceItemDto.js'

export class UpdateServiceItemUseCase {
  constructor(private readonly serviceItemRepository: IServiceItemRepository) {}

  async execute(id: string, dto: UpdateServiceItemDto): Promise<ServiceItemResponseDto> {
    const item = await this.serviceItemRepository.findById(id)
    if (!item) throw new AppError(404, ERROR_MESSAGES.SERVICE_ITEM.NOT_FOUND)

    if (dto.code && dto.code !== item.code) {
      const existing = await this.serviceItemRepository.findByCode(dto.code)
      if (existing) throw new AppError(409, ERROR_MESSAGES.SERVICE_ITEM.CODE_EXISTS)
    }

    const updated = await this.serviceItemRepository.update(id, dto)
    return ServiceItemMapper.toDto(updated)
  }
}
