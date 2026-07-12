import type { IncidentEntity } from '../entities/incidentEntity.js'
import type { PaginatedResult } from './iPaginatedResult.js'

export interface IncidentFilters {
  internmentId: string
  page:         number
  limit:        number
  severity?:    string
  status?:      string
}

export interface IIncidentRepository {
  findAll(filters: IncidentFilters): Promise<PaginatedResult<IncidentEntity>>
  findById(id: string, internmentId: string): Promise<IncidentEntity | null>
  create(data: Omit<IncidentEntity, 'id' | 'createdAt'>): Promise<IncidentEntity>
  updateStatus(id: string, status: string): Promise<IncidentEntity>
  resolve(id: string, resolution: string, resolvedAt: Date): Promise<IncidentEntity>
}
