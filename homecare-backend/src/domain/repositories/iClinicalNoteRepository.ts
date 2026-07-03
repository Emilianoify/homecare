import type { ClinicalNoteEntity } from '../entities/clinicalNoteEntity.js'

export interface IClinicalNoteRepository {
  findAllByInternment(internmentId: string): Promise<ClinicalNoteEntity[]>
  findById(id: string, internmentId: string): Promise<ClinicalNoteEntity | null>
  findByVisit(visitId: string): Promise<ClinicalNoteEntity | null>
  create(data: Omit<ClinicalNoteEntity, 'id' | 'createdAt'>): Promise<ClinicalNoteEntity>
  sign(id: string): Promise<ClinicalNoteEntity>
}
