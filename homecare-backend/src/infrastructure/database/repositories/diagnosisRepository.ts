import { prisma } from '../prismaClient.js'
import { Prisma } from '../../../generated/prisma/client.js'
import type { IDiagnosisRepository } from '../../../domain/repositories/iDiagnosisRepository.js'
import type { DiagnosisEntity } from '../../../domain/entities/diagnosisEntity.js'

export class DiagnosisRepository implements IDiagnosisRepository {
  async findAllByInternment(internmentId: string): Promise<DiagnosisEntity[]> {
    const result = await prisma.diagnosis.findMany({
      where:   { internmentId },
      orderBy: [{ type: 'asc' }, { dateFrom: 'desc' }],
    })
    return result as DiagnosisEntity[]
  }

  async findById(id: string, internmentId: string): Promise<DiagnosisEntity | null> {
    const result = await prisma.diagnosis.findFirst({
      where: { id, internmentId },
    })
    return result as DiagnosisEntity | null
  }

  async findActivePrimary(internmentId: string): Promise<DiagnosisEntity | null> {
    const result = await prisma.diagnosis.findFirst({
      where: {
        internmentId,
        type:   'PRIMARY',
        status: { not: 'RESOLVED' },
        dateTo: null,
      },
    })
    return result as DiagnosisEntity | null
  }

  async create(data: Omit<DiagnosisEntity, 'id' | 'createdAt'>): Promise<DiagnosisEntity> {
    const result = await prisma.diagnosis.create({
      data: data as Prisma.DiagnosisUncheckedCreateInput,
    })
    return result as DiagnosisEntity
  }

  async update(
    id: string,
    data: Partial<Omit<DiagnosisEntity, 'id' | 'internmentId' | 'createdAt'>>
  ): Promise<DiagnosisEntity> {
    const result = await prisma.diagnosis.update({
      where: { id },
      data:  data as Prisma.DiagnosisUncheckedUpdateInput,
    })
    return result as DiagnosisEntity
  }
}
