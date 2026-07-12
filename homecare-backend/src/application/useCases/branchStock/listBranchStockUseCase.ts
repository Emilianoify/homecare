import type { IBranchStockRepository } from '../../../domain/repositories/iBranchStockRepository.js'
import { BranchStockMapper } from '../../../interfaces/http/mappers/branchStockMapper.js'
import type { BranchStockResponseDto } from '../../../interfaces/http/dtos/branchStockDto.js'

export class ListBranchStockUseCase {
  constructor(private readonly branchStockRepository: IBranchStockRepository) {}

  async execute(companyId: string, branchId?: string): Promise<BranchStockResponseDto[]> {
    const items = await this.branchStockRepository.findAll(companyId, branchId)
    return items.map(BranchStockMapper.toDto)
  }
}
