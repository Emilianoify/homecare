import type { DiagnosisEntity } from '../entities/diagnosisEntity.js'

export interface IDiagnosisRepository {
  findAllByInternment(internmentId: string): Promise<DiagnosisEntity[]>
  findById(id: string, internmentId: string): Promise<DiagnosisEntity | null>
  findActivePrimary(internmentId: string): Promise<DiagnosisEntity | null>
  create(data: Omit<DiagnosisEntity, 'id' | 'createdAt'>): Promise<DiagnosisEntity>
  update(id: string, data: Partial<Omit<DiagnosisEntity, 'id' | 'internmentId' | 'createdAt'>>): Promise<DiagnosisEntity>
}
