import { prisma } from '../prismaClient.js'
import type { IAlertConfigRepository } from '../../../domain/repositories/iAlertConfigRepository.js'
import type { AlertConfigEntity } from '../../../domain/entities/alertConfigEntity.js'
import { AlertTriggerType } from '../../../generated/prisma/enums.js'

export class AlertConfigRepository implements IAlertConfigRepository {
  async findAll(companyId: string, onlyActive?: boolean): Promise<AlertConfigEntity[]> {
    const rows = await prisma.alertConfig.findMany({
      where: {
        companyId,
        deletedAt: null,
        ...(onlyActive === true && { active: true }),
      },
      orderBy: { triggerType: 'asc' },
    })
    return rows.map(this.toDomain)
  }

  async findById(id: string, companyId: string): Promise<AlertConfigEntity | null> {
    const row = await prisma.alertConfig.findFirst({
      where: { id, companyId, deletedAt: null },
    })
    return row ? this.toDomain(row) : null
  }

  async findActiveByTriggerType(
    triggerType: string,
    companyId:   string
  ): Promise<AlertConfigEntity | null> {
    const row = await prisma.alertConfig.findFirst({
      where: { triggerType: triggerType as AlertTriggerType, companyId, active: true, deletedAt: null },
    })
    return row ? this.toDomain(row) : null
  }

  async create(
    data: Omit<AlertConfigEntity, 'id' | 'createdAt' | 'deletedAt'>
  ): Promise<AlertConfigEntity> {
    const row = await prisma.alertConfig.create({
      data: {
        companyId:     data.companyId,
        triggerType:   data.triggerType as AlertTriggerType,
        thresholdDays: data.thresholdDays,
        active:        data.active,
        notifyRoles:   data.notifyRoles,
      }
    })
    return this.toDomain(row)
  }

  async update(
    id:   string,
    data: Partial<Omit<AlertConfigEntity, 'id' | 'companyId' | 'createdAt' | 'deletedAt'>>
  ): Promise<AlertConfigEntity> {
    const row = await prisma.alertConfig.update({
      where: { id },
      data: {
        ...(data.triggerType !== undefined && { triggerType: data.triggerType as AlertTriggerType }),
        ...(data.thresholdDays !== undefined && { thresholdDays: data.thresholdDays }),
        ...(data.active !== undefined && { active: data.active }),
        ...(data.notifyRoles !== undefined && { notifyRoles: data.notifyRoles }),
      }
    })
    return this.toDomain(row)
  }

  async softDelete(id: string): Promise<void> {
    await prisma.alertConfig.update({
      where: { id },
      data:  { deletedAt: new Date() },
    })
  }

  private toDomain = (row: {
    id:            string
    companyId:     string
    triggerType:   AlertTriggerType
    thresholdDays: number
    active:        boolean
    notifyRoles:   unknown
    createdAt:     Date
    deletedAt:     Date | null
  }): AlertConfigEntity => {
    return {
      id:            row.id,
      companyId:     row.companyId,
      triggerType:   row.triggerType,
      thresholdDays: row.thresholdDays,
      active:        row.active,
      notifyRoles:   row.notifyRoles as string[],
      createdAt:     row.createdAt,
      deletedAt:     row.deletedAt,
    }
  }
}
