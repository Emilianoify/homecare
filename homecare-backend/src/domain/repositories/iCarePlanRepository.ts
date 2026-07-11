import type { CarePlanEntity } from '../entities/carePlanEntity.js'

export interface CarePlanFilters {
  internmentId: string
  active?:      boolean
}

export interface ICarePlanRepository {
  findAll(filters: CarePlanFilters): Promise<CarePlanEntity[]>
  findById(id: string, internmentId: string): Promise<CarePlanEntity | null>
  findActiveByProfessionalAndSpecialty(
    internmentId:   string,
    professionalId: string,
    specialty:      string
  ): Promise<CarePlanEntity | null>
  create(data: Omit<CarePlanEntity, 'id' | 'createdAt'>): Promise<CarePlanEntity>
  deactivate(id: string): Promise<CarePlanEntity>
}
