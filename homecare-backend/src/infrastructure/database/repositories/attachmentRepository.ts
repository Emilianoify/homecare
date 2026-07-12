import { prisma } from '../prismaClient.js'
import type { IAttachmentRepository, AttachmentFilters } from '../../../domain/repositories/iAttachmentRepository.js'
import type { AttachmentEntity } from '../../../domain/entities/attachmentEntity.js'
import { AttachmentType } from '../../../generated/prisma/enums.js'

export class AttachmentRepository implements IAttachmentRepository {
  async findAll({ internmentId, clinicalNoteId, type }: AttachmentFilters): Promise<AttachmentEntity[]> {
    const rows = await prisma.attachment.findMany({
      where: {
        internmentId,
        ...(clinicalNoteId !== undefined && { clinicalNoteId }),
        ...(type           && { type: type as AttachmentType }),
      },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async findById(id: string, internmentId: string): Promise<AttachmentEntity | null> {
    const row = await prisma.attachment.findFirst({
      where: { id, internmentId },
    })
    return row ? this.toDomain(row) : null
  }

  async findClinicalNoteByIdAndInternment(
    clinicalNoteId: string,
    internmentId:   string
  ): Promise<{ id: string } | null> {
    return prisma.clinicalNote.findFirst({
      where:  { id: clinicalNoteId, internmentId },
      select: { id: true },
    })
  }

  async create(data: Omit<AttachmentEntity, 'id' | 'createdAt'>): Promise<AttachmentEntity> {
    const row = await prisma.attachment.create({
      data: {
        internmentId:   data.internmentId,
        clinicalNoteId: data.clinicalNoteId,
        uploadedById:   data.uploadedById,
        type:           data.type as AttachmentType,
        fileName:       data.fileName,
        storageUrl:     data.storageUrl,
        mimeType:       data.mimeType,
        sizeBytes:      BigInt(data.sizeBytes),
      },
    })
    return this.toDomain(row)
  }

  private toDomain(row: {
    id:             string
    internmentId:   string
    clinicalNoteId: string | null
    uploadedById:   string
    type:           string
    fileName:       string
    storageUrl:     string
    mimeType:       string
    sizeBytes:      bigint
    createdAt:      Date
  }): AttachmentEntity {
    return {
      id:             row.id,
      internmentId:   row.internmentId,
      clinicalNoteId: row.clinicalNoteId,
      uploadedById:   row.uploadedById,
      type:           row.type,
      fileName:       row.fileName,
      storageUrl:     row.storageUrl,
      mimeType:       row.mimeType,
      sizeBytes:      Number(row.sizeBytes),
      createdAt:      row.createdAt,
    }
  }
}
