import type { EquipmentEntity } from '../entities/equipmentEntity.js'
import type { PaginatedResult } from './iPaginatedResult.js'

export interface EquipmentFilters {
  companyId: string
  page:      number
  limit:     number
  branchId?: string
  status?:   string
  search?:   string
}

export interface IEquipmentRepository {
  findAll(filters: EquipmentFilters): Promise<PaginatedResult<EquipmentEntity>>
  findById(id: string, companyId: string): Promise<EquipmentEntity | null>
  create(data: Omit<EquipmentEntity, 'id' | 'createdAt' | 'deletedAt'>): Promise<EquipmentEntity>
  update(id: string, data: Partial<Omit<EquipmentEntity, 'id' | 'companyId' | 'createdAt' | 'deletedAt'>>): Promise<EquipmentEntity>
  updateStatus(id: string, status: string): Promise<EquipmentEntity>
  softDelete(id: string): Promise<void>
}
