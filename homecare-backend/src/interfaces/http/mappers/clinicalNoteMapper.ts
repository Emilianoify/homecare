import type { ClinicalNoteEntity } from '../../../domain/entities/clinicalNoteEntity.js'
import type { ClinicalNoteResponseDto } from '../dtos/clinicalNoteDto.js'

export class ClinicalNoteMapper {
  static toDto(note: ClinicalNoteEntity): ClinicalNoteResponseDto {
    return {
      id:             note.id,
      internmentId:   note.internmentId,
      visitId:        note.visitId,
      professionalId: note.professionalId,
      specialty:      note.specialty,
      datetime:       note.datetime.toISOString(),
      content:        note.content,
      contentHash:    note.contentHash,
      lockedAt:       note.lockedAt?.toISOString() ?? null,
      signed:         note.signed,
      createdAt:      note.createdAt.toISOString(),
    }
  }
}
