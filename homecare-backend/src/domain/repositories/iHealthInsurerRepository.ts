import type { HealthInsurerEntity } from '../entities/healthInsurerEntity.js'
import type { PaginatedResult } from './iPaginatedResult.js'

export interface HealthInsurerFilters {
  companyId:    string
  page:         number
  limit:        number
  search?:      string
  insurerType?: 'NATIONAL_INSURANCE' | 'PROVINCIAL_INSURANCE' | 'PREPAID' | 'PRIVATE'
  active?:      boolean
}

export interface IHealthInsurerRepository {
  findAll(filters: HealthInsurerFilters): Promise<PaginatedResult<HealthInsurerEntity>>
  findById(id: string, companyId: string): Promise<HealthInsurerEntity | null>
  findByCuit(cuit: string, companyId: string): Promise<HealthInsurerEntity | null>
  create(data: Omit<HealthInsurerEntity, 'id' | 'createdAt' | 'deletedAt'>): Promise<HealthInsurerEntity>
  update(id: string, data: Partial<Omit<HealthInsurerEntity, 'id' | 'companyId' | 'createdAt' | 'deletedAt'>>): Promise<HealthInsurerEntity>
  softDelete(id: string): Promise<void>
}
