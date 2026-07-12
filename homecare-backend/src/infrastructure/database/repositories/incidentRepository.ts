import { prisma } from '../prismaClient.js'
import type { IIncidentRepository, IncidentFilters } from '../../../domain/repositories/iIncidentRepository.js'
import type { IncidentEntity } from '../../../domain/entities/incidentEntity.js'
import type { PaginatedResult } from '../../../domain/repositories/iPaginatedResult.js'
import { IncidentType, IncidentSeverity, IncidentStatus } from '../../../generated/prisma/enums.js'

export class IncidentRepository implements IIncidentRepository {
  async findAll({ internmentId, page, limit, severity, status }: IncidentFilters): Promise<PaginatedResult<IncidentEntity>> {
    const where = {
      internmentId,
      ...(severity && { severity: severity as IncidentSeverity }),
      ...(status   && { status: status as IncidentStatus }),
    }

    const [items, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        skip:    (page - 1) * limit,
        take:    limit,
        orderBy: [{ severity: 'desc' }, { occurredAt: 'desc' }],
      }),
      prisma.incident.count({ where }),
    ])

    return { items: items.map(this.toDomain), total }
  }

  async findById(id: string, internmentId: string): Promise<IncidentEntity | null> {
    const item = await prisma.incident.findFirst({ where: { id, internmentId } })
    return item ? this.toDomain(item) : null
  }

  async create(data: Omit<IncidentEntity, 'id' | 'createdAt'>): Promise<IncidentEntity> {
    const item = await prisma.incident.create({
      data: {
        internmentId: data.internmentId,
        reportedById: data.reportedById,
        type:         data.type as IncidentType,
        severity:     data.severity as IncidentSeverity,
        status:       data.status as IncidentStatus,
        description:  data.description,
        resolution:   data.resolution,
        occurredAt:   data.occurredAt,
        resolvedAt:   data.resolvedAt,
      }
    })
    return this.toDomain(item)
  }

  async updateStatus(id: string, status: string): Promise<IncidentEntity> {
    const item = await prisma.incident.update({
      where: { id },
      data:  { status: status as IncidentStatus }
    })
    return this.toDomain(item)
  }

  async resolve(id: string, resolution: string, resolvedAt: Date): Promise<IncidentEntity> {
    const item = await prisma.incident.update({
      where: { id },
      data:  { status: IncidentStatus.RESOLVED, resolution, resolvedAt },
    })
    return this.toDomain(item)
  }

  private toDomain(row: {
    id:           string
    internmentId: string
    reportedById: string
    type:         IncidentType
    severity:     IncidentSeverity
    status:       IncidentStatus
    description:  string
    resolution:   string | null
    occurredAt:   Date
    resolvedAt:   Date | null
    createdAt:    Date
  }): IncidentEntity {
    return {
      id:           row.id,
      internmentId: row.internmentId,
      reportedById: row.reportedById,
      type:         row.type,
      severity:     row.severity,
      status:       row.status,
      description:  row.description,
      resolution:   row.resolution,
      occurredAt:   row.occurredAt,
      resolvedAt:   row.resolvedAt,
      createdAt:    row.createdAt,
    }
  }
}
