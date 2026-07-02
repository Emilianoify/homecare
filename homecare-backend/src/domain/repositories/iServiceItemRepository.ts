import type { ServiceItemEntity } from '../entities/serviceItemEntity.js'
import type { PaginatedResult } from './iPaginatedResult.js'

export interface ServiceItemFilters {
  page:        number
  limit:       number
  search?:     string
  specialty?:  string
  active?:     boolean
}

export interface IServiceItemRepository {
  findAll(filters: ServiceItemFilters): Promise<PaginatedResult<ServiceItemEntity>>
  findById(id: string): Promise<ServiceItemEntity | null>
  findByCode(code: string): Promise<ServiceItemEntity | null>
  create(data: Omit<ServiceItemEntity, 'id' | 'createdAt' | 'deletedAt'>): Promise<ServiceItemEntity>
  update(id: string, data: Partial<Omit<ServiceItemEntity, 'id' | 'createdAt' | 'deletedAt'>>): Promise<ServiceItemEntity>
  softDelete(id: string): Promise<void>
}
