import type { BranchStockEntity } from '../../../domain/entities/branchStockEntity.js'
import type { StockMovementEntity } from '../../../domain/entities/stockMovementEntity.js'
import type { BranchStockResponseDto, StockMovementResponseDto } from '../dtos/branchStockDto.js'

export class BranchStockMapper {
  static toDto(s: BranchStockEntity): BranchStockResponseDto {
    return {
      id:           s.id,
      companyId:    s.companyId,
      branchId:     s.branchId,
      supplyId:     s.supplyId,
      currentStock: s.currentStock,
      updatedAt:    s.updatedAt.toISOString(),
    }
  }

  static toMovementDto(m: StockMovementEntity): StockMovementResponseDto {
    return {
      id:            m.id,
      companyId:     m.companyId,
      branchId:      m.branchId,
      supplyId:      m.supplyId,
      type:          m.type,
      quantity:      m.quantity,
      previousStock: m.previousStock,
      newStock:      m.newStock,
      reference:     m.reference,
      notes:         m.notes,
      createdById:   m.createdById,
      createdAt:     m.createdAt.toISOString(),
    }
  }
}
