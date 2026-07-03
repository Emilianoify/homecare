import type { InternmentEntity } from '../entities/internmentEntity.js'
import type { PaginatedResult } from './iPaginatedResult.js'

export interface InternmentFilters {
  page:             number
  limit:            number
  status?:          string
  patientId?:       string
  healthInsurerId?: string
  branchId?:        string
}

export interface IInternmentRepository {
  findAll(filters: InternmentFilters): Promise<PaginatedResult<InternmentEntity>>
  findById(id: string): Promise<InternmentEntity | null>
  findActiveByPatient(patientId: string): Promise<InternmentEntity | null>
  create(data: Omit<InternmentEntity, 'id' | 'createdAt' | 'deletedAt'>): Promise<InternmentEntity>
  update(id: string, data: Partial<Omit<InternmentEntity, 'id' | 'createdAt' | 'deletedAt'>>): Promise<InternmentEntity>
  softDelete(id: string): Promise<void>
  findVisitByIdAndInternment(visitId: string, internmentId: string): Promise<{ id: string } | null>
}
