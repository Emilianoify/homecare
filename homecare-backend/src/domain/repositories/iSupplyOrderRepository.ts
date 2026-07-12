import type { SupplyOrderEntity, SupplyOrderItemEntity } from '../entities/supplyOrderEntity.js'
import type { PaginatedResult } from './iPaginatedResult.js'

export interface SupplyOrderFilters {
  internmentId: string
  page:         number
  limit:        number
  status?:      string
}

export interface ISupplyOrderRepository {
  findAll(filters: SupplyOrderFilters): Promise<PaginatedResult<SupplyOrderEntity>>
  findById(id: string, internmentId: string): Promise<SupplyOrderEntity | null>
  create(data: {
    internmentId: string
    companyId:    string
    createdById:  string
    budgetId:     string | null
    notes:        string | null
  }): Promise<SupplyOrderEntity>
  updateStatus(id: string, status: string, cancellationReason?: string): Promise<SupplyOrderEntity>
  addItem(data: {
    supplyOrderId: string
    supplyId:      string | null
    description:   string
    quantity:      number
    unitPrice:     number
  }): Promise<SupplyOrderItemEntity>
  removeItem(itemId: string, supplyOrderId: string): Promise<void>
  findItem(itemId: string, supplyOrderId: string): Promise<SupplyOrderItemEntity | null>
}
