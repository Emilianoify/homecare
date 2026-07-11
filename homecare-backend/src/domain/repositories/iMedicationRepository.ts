import type { MedicationEntity } from '../entities/medicationEntity.js'

export interface MedicationFilters {
  internmentId: string
  active?:      boolean
}

export interface IMedicationRepository {
  findAll(filters: MedicationFilters): Promise<MedicationEntity[]>
  findById(id: string, internmentId: string): Promise<MedicationEntity | null>
  create(data: Omit<MedicationEntity, 'id' | 'createdAt'>): Promise<MedicationEntity>
  update(id: string, data: Partial<Omit<MedicationEntity, 'id' | 'internmentId' | 'prescribedById' | 'createdAt'>>): Promise<MedicationEntity>
}
