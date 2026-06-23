import type { PatientEntity } from '../entities/patientEntity.js'
import type { PaginatedResult } from './iPaginatedResult.js'

export interface PatientFilters {
  companyId: string
  page:      number
  limit:     number
  search?:   string
  branchId?: string
}

export interface IPatientRepository {
  findAll(filters: PatientFilters): Promise<PaginatedResult<PatientEntity>>
  findById(id: string, companyId: string): Promise<PatientEntity | null>
  findByDni(dni: string, companyId: string): Promise<PatientEntity | null>
  create(data: Omit<PatientEntity, 'id' | 'createdAt' | 'deletedAt'>): Promise<PatientEntity>
  update(id: string, data: Partial<Omit<PatientEntity, 'id' | 'companyId' | 'createdAt' | 'deletedAt'>>): Promise<PatientEntity>
  softDelete(id: string): Promise<void>
}
