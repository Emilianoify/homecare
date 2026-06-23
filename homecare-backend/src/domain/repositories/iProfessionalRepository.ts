import type { ProfessionalEntity } from '../entities/professionalEntity.js'
import type { PaginatedResult } from './iPaginatedResult.js'

export interface ProfessionalFilters {
  companyId:  string
  page:       number
  limit:      number
  search?:    string
  specialty?: string
  active?:    boolean
}

export interface IProfessionalRepository {
  findAll(filters: ProfessionalFilters): Promise<PaginatedResult<ProfessionalEntity>>
  findById(id: string, companyId: string): Promise<ProfessionalEntity | null>
  findByCuit(cuit: string, companyId: string): Promise<ProfessionalEntity | null>
  create(data: Omit<ProfessionalEntity, 'id' | 'createdAt' | 'deletedAt'>): Promise<ProfessionalEntity>
  update(id: string, data: Partial<Omit<ProfessionalEntity, 'id' | 'companyId' | 'createdAt' | 'deletedAt'>>): Promise<ProfessionalEntity>
  softDelete(id: string): Promise<void>
}
