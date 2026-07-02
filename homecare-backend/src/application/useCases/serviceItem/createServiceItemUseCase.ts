import type { IServiceItemRepository } from '../../../domain/repositories/iServiceItemRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { ServiceItemMapper } from '../../../interfaces/http/mappers/serviceItemMapper.js'
import type { CreateServiceItemDto } from '../../../interfaces/http/schemas/serviceItemSchema.js'
import type { ServiceItemResponseDto } from '../../../interfaces/http/dtos/serviceItemDto.js'

export class CreateServiceItemUseCase {
  constructor(private readonly serviceItemRepository: IServiceItemRepository) {}

  async execute(dto: CreateServiceItemDto): Promise<ServiceItemResponseDto> {
    const existing = await this.serviceItemRepository.findByCode(dto.code)
    if (existing) throw new AppError(409, ERROR_MESSAGES.SERVICE_ITEM.CODE_EXISTS)

    const item = await this.serviceItemRepository.create({
      specialty:   dto.specialty,
      code:        dto.code,
      description: dto.description,
      billingMode: dto.billingMode,
      basePrice:   dto.basePrice,
      active:      dto.active,
    })

    return ServiceItemMapper.toDto(item)
  }
}
