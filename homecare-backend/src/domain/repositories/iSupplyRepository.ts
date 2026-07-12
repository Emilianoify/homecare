import type { SupplyEntity } from '../entities/supplyEntity.js'
import type { PaginatedResult } from './iPaginatedResult.js'

export interface SupplyFilters {
  companyId: string
  page:      number
  limit:     number
  search?:   string
  active?:   boolean
}

export interface ISupplyRepository {
  findAll(filters: SupplyFilters): Promise<PaginatedResult<SupplyEntity>>
  findById(id: string, companyId: string): Promise<SupplyEntity | null>
  findByCode(code: string, companyId: string): Promise<SupplyEntity | null>
  create(data: Omit<SupplyEntity, 'id' | 'createdAt' | 'deletedAt'>): Promise<SupplyEntity>
  update(id: string, data: Partial<Omit<SupplyEntity, 'id' | 'companyId' | 'createdAt' | 'deletedAt'>>): Promise<SupplyEntity>
  softDelete(id: string): Promise<void>
}
