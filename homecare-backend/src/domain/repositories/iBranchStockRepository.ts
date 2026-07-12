import type { BranchStockEntity } from '../entities/branchStockEntity.js'
import type { StockMovementEntity } from '../entities/stockMovementEntity.js'
import type { PaginatedResult } from './iPaginatedResult.js'

export interface BranchStockItem {
  currentStock: number
}

export interface StockMovementFilters {
  companyId: string
  branchId?: string
  supplyId?: string
  page:      number
  limit:     number
}

export interface IBranchStockRepository {
  // Stock
  findAll(companyId: string, branchId?: string): Promise<BranchStockEntity[]>
  findBySupplyAndBranch(supplyId: string, branchId: string): Promise<BranchStockItem | null>
  findOrCreate(supplyId: string, branchId: string, companyId: string): Promise<BranchStockEntity>
  getAllowNegative(companyId: string): Promise<boolean>

  // Movimientos
  createMovement(data: Omit<StockMovementEntity, 'id' | 'createdAt'>): Promise<StockMovementEntity>
  updateStock(supplyId: string, branchId: string, newStock: number): Promise<BranchStockEntity>
  listMovements(filters: StockMovementFilters): Promise<PaginatedResult<StockMovementEntity>>
}
