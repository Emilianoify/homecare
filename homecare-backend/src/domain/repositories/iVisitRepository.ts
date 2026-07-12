import type { VisitEntity } from '../entities/visitEntity.js'
import type { PaginatedResult } from './iPaginatedResult.js'

export interface VisitFilters {
  internmentId:   string
  page:           number
  limit:          number
  professionalId?: string
  status?:        string
  dateFrom?:      Date
  dateTo?:        Date
}

export interface IVisitRepository {
  findAll(filters: VisitFilters): Promise<PaginatedResult<VisitEntity>>
  findById(id: string, internmentId: string): Promise<VisitEntity | null>
  findCarePlanByIdAndInternment(carePlanId: string, internmentId: string): Promise<{ id: string } | null>
  create(data: Omit<VisitEntity, 'id' | 'createdAt'>): Promise<VisitEntity>
  markMissed(id: string, missedReason: string): Promise<VisitEntity>
}
