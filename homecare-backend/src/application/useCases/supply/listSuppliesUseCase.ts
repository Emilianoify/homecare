import type { ISupplyRepository } from '../../../domain/repositories/iSupplyRepository.js'
import { SupplyMapper } from '../../../interfaces/http/mappers/supplyMapper.js'
import type { SupplyQuery } from '../../../interfaces/http/schemas/supplySchema.js'
import type { SupplyListResultDto } from '../../../interfaces/http/dtos/supplyDto.js'

export class ListSuppliesUseCase {
  constructor(private readonly supplyRepository: ISupplyRepository) {}

  async execute(query: SupplyQuery, companyId: string): Promise<SupplyListResultDto> {
    const { items, total } = await this.supplyRepository.findAll({ ...query, companyId })
    return {
      items:      items.map(SupplyMapper.toDto),
      page:       query.page,
      limit:      query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    }
  }
}
