import type { IBranchStockRepository } from '../../../domain/repositories/iBranchStockRepository.js'
import { BranchStockMapper } from '../../../interfaces/http/mappers/branchStockMapper.js'
import type { StockMovementQuery } from '../../../interfaces/http/schemas/branchStockSchema.js'
import type { StockMovementListResultDto } from '../../../interfaces/http/dtos/branchStockDto.js'

export class ListStockMovementsUseCase {
  constructor(private readonly branchStockRepository: IBranchStockRepository) {}

  async execute(companyId: string, query: StockMovementQuery): Promise<StockMovementListResultDto> {
    const { items, total } = await this.branchStockRepository.listMovements({
      companyId,
      branchId: query.branchId,
      supplyId: query.supplyId,
      page:     query.page,
      limit:    query.limit,
    })

    return {
      items:      items.map(BranchStockMapper.toMovementDto),
      page:       query.page,
      limit:      query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    }
  }
}
