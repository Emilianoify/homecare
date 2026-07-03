import { prisma } from '../prismaClient.js'
import { Prisma } from '../../../generated/prisma/client.js'
import type { IClinicalNoteRepository } from '../../../domain/repositories/iClinicalNoteRepository.js'
import type { ClinicalNoteEntity } from '../../../domain/entities/clinicalNoteEntity.js'

export class ClinicalNoteRepository implements IClinicalNoteRepository {
  async findAllByInternment(internmentId: string): Promise<ClinicalNoteEntity[]> {
    const notes = await prisma.clinicalNote.findMany({
      where:   { internmentId },
      orderBy: { datetime: 'desc' },
    })
    return notes as ClinicalNoteEntity[]
  }

  async findById(id: string, internmentId: string): Promise<ClinicalNoteEntity | null> {
    const note = await prisma.clinicalNote.findFirst({
      where: { id, internmentId },
    })
    return note as ClinicalNoteEntity | null
  }

  async findByVisit(visitId: string): Promise<ClinicalNoteEntity | null> {
    const note = await prisma.clinicalNote.findUnique({
      where: { visitId },
    })
    return note as ClinicalNoteEntity | null
  }

  async create(data: Omit<ClinicalNoteEntity, 'id' | 'createdAt'>): Promise<ClinicalNoteEntity> {
    const note = await prisma.clinicalNote.create({ data: data as Prisma.ClinicalNoteUncheckedCreateInput })
    return note as ClinicalNoteEntity
  }

  async sign(id: string): Promise<ClinicalNoteEntity> {
    const signed = await prisma.clinicalNote.update({
      where: { id },
      data:  {
        signed:   true,
        lockedAt: new Date(),
      },
    })
    return signed as ClinicalNoteEntity
  }
}
