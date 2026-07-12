import type { IEquipmentRepository } from '../../../domain/repositories/iEquipmentRepository.js'
import { EquipmentMapper } from '../../../interfaces/http/mappers/equipmentMapper.js'
import type { EquipmentQuery } from '../../../interfaces/http/schemas/equipmentSchema.js'
import type { EquipmentListResultDto } from '../../../interfaces/http/dtos/equipmentDto.js'

export class ListEquipmentUseCase {
  constructor(private readonly equipmentRepository: IEquipmentRepository) {}

  async execute(query: EquipmentQuery, companyId: string): Promise<EquipmentListResultDto> {
    const { items, total } = await this.equipmentRepository.findAll({ ...query, companyId })

    return {
      items:      items.map(EquipmentMapper.toDto),
      page:       query.page,
      limit:      query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1, // Avoid 0 totalPages if no items
    }
  }
}
