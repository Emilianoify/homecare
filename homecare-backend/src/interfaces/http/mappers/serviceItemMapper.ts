import type { ServiceItemEntity } from '../../../domain/entities/serviceItemEntity.js'
import type { ServiceItemResponseDto } from '../dtos/serviceItemDto.js'

export class ServiceItemMapper {
  static toDto(item: ServiceItemEntity): ServiceItemResponseDto {
    return {
      id:          item.id,
      specialty:   item.specialty,
      code:        item.code,
      description: item.description,
      billingMode: item.billingMode,
      basePrice:   item.basePrice,
      active:      item.active,
      createdAt:   item.createdAt.toISOString(),
    }
  }
}
