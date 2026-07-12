import type { AttachmentEntity } from '../../../domain/entities/attachmentEntity.js'
import type { AttachmentResponseDto } from '../dtos/attachmentDto.js'

export class AttachmentMapper {
  static toDto(a: AttachmentEntity): AttachmentResponseDto {
    return {
      id:             a.id,
      internmentId:   a.internmentId,
      clinicalNoteId: a.clinicalNoteId,
      uploadedById:   a.uploadedById,
      type:           a.type,
      fileName:       a.fileName,
      storageUrl:     a.storageUrl,
      mimeType:       a.mimeType,
      sizeBytes:      a.sizeBytes,
      createdAt:      a.createdAt.toISOString(),
    }
  }
}
