import type { FunctionalStatusEntity } from '../entities/functionalStatusEntity.js'

export interface IFunctionalStatusRepository {
  findAllByPatient(patientId: string): Promise<FunctionalStatusEntity[]>
  findLatestByPatient(patientId: string): Promise<FunctionalStatusEntity | null>
  findByInternment(patientId: string, internmentId: string): Promise<FunctionalStatusEntity[]>
  create(data: Omit<FunctionalStatusEntity, 'id' | 'createdAt'>): Promise<FunctionalStatusEntity>
}
