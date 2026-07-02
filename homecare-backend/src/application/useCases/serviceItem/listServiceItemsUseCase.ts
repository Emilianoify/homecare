import type { IServiceItemRepository } from '../../../domain/repositories/iServiceItemRepository.js'
import { ServiceItemMapper } from '../../../interfaces/http/mappers/serviceItemMapper.js'
import type { ServiceItemQuery } from '../../../interfaces/http/schemas/serviceItemSchema.js'
import type { ServiceItemListResultDto } from '../../../interfaces/http/dtos/serviceItemDto.js'

export class ListServiceItemsUseCase {
  constructor(private readonly serviceItemRepository: IServiceItemRepository) {}

  async execute(query: ServiceItemQuery): Promise<ServiceItemListResultDto> {
    const { items, total } = await this.serviceItemRepository.findAll(query)

    return {
      items:      items.map(ServiceItemMapper.toDto),
      page:       query.page,
      limit:      query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    }
  }
}
