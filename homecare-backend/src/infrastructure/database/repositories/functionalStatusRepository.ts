import { prisma } from '../prismaClient.js'
import { Prisma } from '../../../generated/prisma/client.js'
import type { IFunctionalStatusRepository } from '../../../domain/repositories/iFunctionalStatusRepository.js'
import type { FunctionalStatusEntity } from '../../../domain/entities/functionalStatusEntity.js'

export class FunctionalStatusRepository implements IFunctionalStatusRepository {
  async findAllByPatient(patientId: string): Promise<FunctionalStatusEntity[]> {
    const results = await prisma.functionalStatus.findMany({
      where:   { patientId },
      orderBy: { date: 'desc' },
    })
    return results.map(item => this.toDomain(item))
  }

  async findLatestByPatient(patientId: string): Promise<FunctionalStatusEntity | null> {
    const result = await prisma.functionalStatus.findFirst({
      where:   { patientId },
      orderBy: { date: 'desc' },
    })
    return result ? this.toDomain(result) : null
  }

  async findByInternment(patientId: string, internmentId: string): Promise<FunctionalStatusEntity[]> {
    const results = await prisma.functionalStatus.findMany({
      where:   { patientId, internmentId },
      orderBy: { date: 'desc' },
    })
    return results.map(item => this.toDomain(item))
  }

  async create(data: Omit<FunctionalStatusEntity, 'id' | 'createdAt'>): Promise<FunctionalStatusEntity> {
    const result = await prisma.functionalStatus.create({
      data: {
        ...data,
        barthelScore: data.barthelScore as Prisma.InputJsonValue,
      }
    })
    return this.toDomain(result)
  }

  private toDomain(record: {
    id:                     string
    patientId:              string
    internmentId:           string
    recordedById:           string
    date:                   Date
    bedridden:              boolean
    wheelchair:             boolean
    oxygenDependent:        boolean
    oxygenLitersPerMin:     { toNumber(): number } | null
    tracheostomy:           boolean
    pumpFeeding:            boolean
    nasogastricTube:        boolean
    urinaryCatheter:        boolean
    pressureUlcers:         boolean
    pressureUlcersLocation: string | null
    barthelScore:           unknown
    notes:                  string | null
    createdAt:              Date
  }): FunctionalStatusEntity {
    return {
      ...record,
      oxygenLitersPerMin: record.oxygenLitersPerMin
        ? record.oxygenLitersPerMin.toNumber()
        : null,
      barthelScore: record.barthelScore as Record<string, unknown> | null,
    }
  }
}
