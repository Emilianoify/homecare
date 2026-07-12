import { prisma } from '../prismaClient.js'
import type { IVisitRepository, VisitFilters } from '../../../domain/repositories/iVisitRepository.js'
import type { VisitEntity } from '../../../domain/entities/visitEntity.js'
import type { PaginatedResult } from '../../../domain/repositories/iPaginatedResult.js'
import { VisitStatus } from '../../../generated/prisma/enums.js'

export class VisitRepository implements IVisitRepository {
  async findAll({
    internmentId,
    page,
    limit,
    professionalId,
    status,
    dateFrom,
    dateTo,
  }: VisitFilters): Promise<PaginatedResult<VisitEntity>> {
    const where = {
      internmentId,
      ...(professionalId && { professionalId }),
      ...(status         && { status: status as VisitStatus }),
      ...(dateFrom || dateTo ? {
        completedAt: {
          ...(dateFrom && { gte: dateFrom }),
          ...(dateTo   && { lte: dateTo }),
        },
      } : {}),
    }

    const [rows, total] = await Promise.all([
      prisma.visit.findMany({
        where,
        skip:    (page - 1) * limit,
        take:    limit,
        orderBy: { completedAt: 'desc' },
      }),
      prisma.visit.count({ where }),
    ])

    return { items: rows.map((row) => this.toDomain(row)), total }
  }

  async findById(id: string, internmentId: string): Promise<VisitEntity | null> {
    const row = await prisma.visit.findFirst({ where: { id, internmentId } })
    return row ? this.toDomain(row) : null
  }

  async findCarePlanByIdAndInternment(
    carePlanId:   string,
    internmentId: string
  ): Promise<{ id: string } | null> {
    return prisma.carePlan.findFirst({
      where:  { id: carePlanId, internmentId },
      select: { id: true },
    })
  }

  async create(data: Omit<VisitEntity, 'id' | 'createdAt'>): Promise<VisitEntity> {
    const row = await prisma.visit.create({
      data: {
        carePlanId:     data.carePlanId,
        professionalId: data.professionalId,
        internmentId:   data.internmentId,
        completedAt:    data.completedAt,
        status:         data.status as VisitStatus,
        missedReason:   data.missedReason,
        lat:            data.lat,
        lng:            data.lng,
        billed:         data.billed,
        notes:          data.notes,
        scheduledDate:  data.completedAt, // fallback for required DB field
      }
    })
    return this.toDomain(row)
  }

  async markMissed(id: string, missedReason: string): Promise<VisitEntity> {
    const row = await prisma.visit.update({
      where: { id },
      data:  { status: VisitStatus.MISSED, missedReason },
    })
    return this.toDomain(row)
  }

  private toDomain(row: {
    id:             string
    carePlanId:     string
    professionalId: string
    internmentId:   string
    completedAt:    Date | null
    status:         string
    missedReason:   string | null
    lat:            { toNumber(): number } | null
    lng:            { toNumber(): number } | null
    billed:         boolean
    notes:          string | null
    createdAt:      Date
    scheduledDate?: Date | null
    scheduledTime?: string | null
    recovered?:     boolean
    recoveredFromId?: string | null
  }): VisitEntity {
    return {
      id:             row.id,
      carePlanId:     row.carePlanId,
      professionalId: row.professionalId,
      internmentId:   row.internmentId,
      completedAt:    row.completedAt || row.createdAt,
      status:         row.status,
      missedReason:   row.missedReason,
      lat:            row.lat  ? row.lat.toNumber()  : null,
      lng:            row.lng  ? row.lng.toNumber()  : null,
      billed:         row.billed,
      notes:          row.notes,
      createdAt:      row.createdAt,
    }
  }
}
