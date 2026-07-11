import { prisma } from '../prismaClient.js'
import { Prisma } from '../../../generated/prisma/client.js'
import type { ICarePlanRepository, CarePlanFilters } from '../../../domain/repositories/iCarePlanRepository.js'
import type { CarePlanEntity } from '../../../domain/entities/carePlanEntity.js'

export class CarePlanRepository implements ICarePlanRepository {
  async findAll({ internmentId, active }: CarePlanFilters): Promise<CarePlanEntity[]> {
    const rows = await prisma.carePlan.findMany({
      where: {
        internmentId,
        ...(active !== undefined && { active }),
      },
      orderBy: [{ active: 'desc' }, { startDate: 'desc' }],
    })
    return rows.map(row => this.toDomain(row))
  }

  async findById(id: string, internmentId: string): Promise<CarePlanEntity | null> {
    const row = await prisma.carePlan.findFirst({
      where: { id, internmentId },
    })
    return row ? this.toDomain(row) : null
  }

  async findActiveByProfessionalAndSpecialty(
    internmentId:   string,
    professionalId: string,
    specialty:      string
  ): Promise<CarePlanEntity | null> {
    const row = await prisma.carePlan.findFirst({
      where: {
        internmentId,
        professionalId,
        specialty: specialty as Prisma.CarePlanWhereInput['specialty'],
        active: true
      },
    })
    return row ? this.toDomain(row) : null
  }

  async create(data: Omit<CarePlanEntity, 'id' | 'createdAt'>): Promise<CarePlanEntity> {
    const row = await prisma.carePlan.create({
      data: {
        ...data,
        weekDays: data.weekDays as Prisma.InputJsonValue,
      } as Prisma.CarePlanUncheckedCreateInput,
    })
    return this.toDomain(row)
  }

  async deactivate(id: string): Promise<CarePlanEntity> {
    const row = await prisma.carePlan.update({
      where: { id },
      data:  { active: false },
    })
    return this.toDomain(row)
  }

  private toDomain(row: {
    id:              string
    internmentId:    string
    professionalId:  string
    authorizationId: string | null
    specialty:       string
    frequency:       string
    weekDays:        Prisma.JsonValue
    estimatedTime:   string | null
    totalSessions:   number | null
    startDate:       Date
    endDate:         Date | null
    active:          boolean
    createdAt:       Date
  }): CarePlanEntity {
    return {
      id:              row.id,
      internmentId:    row.internmentId,
      professionalId:  row.professionalId,
      authorizationId: row.authorizationId,
      specialty:       row.specialty,
      frequency:       row.frequency,
      weekDays:        row.weekDays as number[] | null,
      estimatedTime:   row.estimatedTime,
      totalSessions:   row.totalSessions,
      startDate:       row.startDate,
      endDate:         row.endDate,
      active:          row.active,
      createdAt:       row.createdAt,
    }
  }
}
