import type { PatientContactEntity } from '../entities/patientContactEntity.js'

export interface IPatientContactRepository {
  findAllByPatient(patientId: string): Promise<PatientContactEntity[]>
  findById(id: string, patientId: string): Promise<PatientContactEntity | null>
  findPrimaryByPatient(patientId: string): Promise<PatientContactEntity | null>
  clearPrimaryByPatient(patientId: string): Promise<void>
  create(data: Omit<PatientContactEntity, 'id' | 'createdAt'>): Promise<PatientContactEntity>
  update(id: string, data: Partial<Omit<PatientContactEntity, 'id' | 'patientId' | 'createdAt'>>): Promise<PatientContactEntity>
  delete(id: string): Promise<void>
}
