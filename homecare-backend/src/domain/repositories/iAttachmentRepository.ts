import type { AttachmentEntity } from '../entities/attachmentEntity.js'

export interface AttachmentFilters {
  internmentId:   string
  clinicalNoteId?: string
  type?:           string
}

export interface IAttachmentRepository {
  findAll(filters: AttachmentFilters): Promise<AttachmentEntity[]>
  findById(id: string, internmentId: string): Promise<AttachmentEntity | null>
  findClinicalNoteByIdAndInternment(
    clinicalNoteId: string,
    internmentId:   string
  ): Promise<{ id: string } | null>
  create(data: Omit<AttachmentEntity, 'id' | 'createdAt'>): Promise<AttachmentEntity>
}
