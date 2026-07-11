import { prisma } from '../prismaClient.js'
import type { IHealthInsurerRepository, HealthInsurerFilters } from '../../../domain/repositories/iHealthInsurerRepository.js'
import type { HealthInsurerEntity } from '../../../domain/entities/healthInsurerEntity.js'
import type { PaginatedResult } from '../../../domain/repositories/iPaginatedResult.js'
import { InsurerType, BillingMode } from '../../../generated/prisma/client.js'

export class HealthInsurerRepository implements IHealthInsurerRepository {
  async findAll({ companyId, page, limit, search, insurerType, active }: HealthInsurerFilters): Promise<PaginatedResult<HealthInsurerEntity>> {
    const where = {
      companyId,
      deletedAt: null,
      ...(insurerType          && { insurerType: insurerType as InsurerType }),
      ...(active !== undefined && { active }),
      ...(search && {
        OR: [
          { name:    { contains: search, mode: 'insensitive' as const } },
          { acronym: { contains: search, mode: 'insensitive' as const } },
          { cuit:    { contains: search } },
        ],
      }),
    }

    const [items, total] = await Promise.all([
      prisma.healthInsurer.findMany({
        where,
        skip:    (page - 1) * limit,
        take:    limit,
        orderBy: { name: 'asc' },
      }),
      prisma.healthInsurer.count({ where }),
    ])

    return {
      items: items.map(item => ({
        id:             item.id,
        companyId:      item.companyId,
        name:           item.name,
        acronym:        item.acronym,
        cuit:           item.cuit,
        rnos:           item.rnos,
        insurerType:    item.insurerType as HealthInsurerEntity['insurerType'],
        billingEmail:   item.billingEmail,
        billingMode:    item.billingMode as HealthInsurerEntity['billingMode'],
        cutoffDay:      item.cutoffDay,
        paymentDays:    item.paymentDays,
        requiresPaper:  item.requiresPaper,
        operativeNotes: item.operativeNotes,
        active:         item.active,
        createdAt:      item.createdAt,
        deletedAt:      item.deletedAt,
      })),
      total,
    }
  }

  async findById(id: string, companyId: string): Promise<HealthInsurerEntity | null> {
    const item = await prisma.healthInsurer.findFirst({
      where: { id, companyId, deletedAt: null },
    })
    if (!item) return null

    return {
      id:             item.id,
      companyId:      item.companyId,
      name:           item.name,
      acronym:        item.acronym,
      cuit:           item.cuit,
      rnos:           item.rnos,
      insurerType:    item.insurerType as HealthInsurerEntity['insurerType'],
      billingEmail:   item.billingEmail,
      billingMode:    item.billingMode as HealthInsurerEntity['billingMode'],
      cutoffDay:      item.cutoffDay,
      paymentDays:    item.paymentDays,
      requiresPaper:  item.requiresPaper,
      operativeNotes: item.operativeNotes,
      active:         item.active,
      createdAt:      item.createdAt,
      deletedAt:      item.deletedAt,
    }
  }

  async findByCuit(cuit: string, companyId: string): Promise<HealthInsurerEntity | null> {
    const item = await prisma.healthInsurer.findFirst({
      where: { cuit, companyId, deletedAt: null },
    })
    if (!item) return null

    return {
      id:             item.id,
      companyId:      item.companyId,
      name:           item.name,
      acronym:        item.acronym,
      cuit:           item.cuit,
      rnos:           item.rnos,
      insurerType:    item.insurerType as HealthInsurerEntity['insurerType'],
      billingEmail:   item.billingEmail,
      billingMode:    item.billingMode as HealthInsurerEntity['billingMode'],
      cutoffDay:      item.cutoffDay,
      paymentDays:    item.paymentDays,
      requiresPaper:  item.requiresPaper,
      operativeNotes: item.operativeNotes,
      active:         item.active,
      createdAt:      item.createdAt,
      deletedAt:      item.deletedAt,
    }
  }

  async create(data: Omit<HealthInsurerEntity, 'id' | 'createdAt' | 'deletedAt'>): Promise<HealthInsurerEntity> {
    const item = await prisma.healthInsurer.create({
      data: {
        companyId:      data.companyId,
        name:           data.name,
        acronym:        data.acronym,
        cuit:           data.cuit,
        rnos:           data.rnos,
        insurerType:    data.insurerType as InsurerType,
        billingEmail:   data.billingEmail,
        billingMode:    data.billingMode as BillingMode,
        cutoffDay:      data.cutoffDay,
        paymentDays:    data.paymentDays,
        requiresPaper:  data.requiresPaper,
        operativeNotes: data.operativeNotes,
        active:         data.active,
      }
    })

    return {
      id:             item.id,
      companyId:      item.companyId,
      name:           item.name,
      acronym:        item.acronym,
      cuit:           item.cuit,
      rnos:           item.rnos,
      insurerType:    item.insurerType as HealthInsurerEntity['insurerType'],
      billingEmail:   item.billingEmail,
      billingMode:    item.billingMode as HealthInsurerEntity['billingMode'],
      cutoffDay:      item.cutoffDay,
      paymentDays:    item.paymentDays,
      requiresPaper:  item.requiresPaper,
      operativeNotes: item.operativeNotes,
      active:         item.active,
      createdAt:      item.createdAt,
      deletedAt:      item.deletedAt,
    }
  }

  async update(
    id: string,
    data: Partial<Omit<HealthInsurerEntity, 'id' | 'companyId' | 'createdAt' | 'deletedAt'>>
  ): Promise<HealthInsurerEntity> {
    const item = await prisma.healthInsurer.update({
      where: { id },
      data: {
        name:           data.name,
        acronym:        data.acronym,
        cuit:           data.cuit,
        rnos:           data.rnos,
        insurerType:    data.insurerType ? (data.insurerType as InsurerType) : undefined,
        billingEmail:   data.billingEmail,
        billingMode:    data.billingMode ? (data.billingMode as BillingMode) : undefined,
        cutoffDay:      data.cutoffDay,
        paymentDays:    data.paymentDays,
        requiresPaper:  data.requiresPaper,
        operativeNotes: data.operativeNotes,
        active:         data.active,
      }
    })

    return {
      id:             item.id,
      companyId:      item.companyId,
      name:           item.name,
      acronym:        item.acronym,
      cuit:           item.cuit,
      rnos:           item.rnos,
      insurerType:    item.insurerType as HealthInsurerEntity['insurerType'],
      billingEmail:   item.billingEmail,
      billingMode:    item.billingMode as HealthInsurerEntity['billingMode'],
      cutoffDay:      item.cutoffDay,
      paymentDays:    item.paymentDays,
      requiresPaper:  item.requiresPaper,
      operativeNotes: item.operativeNotes,
      active:         item.active,
      createdAt:      item.createdAt,
      deletedAt:      item.deletedAt,
    }
  }

  async softDelete(id: string): Promise<void> {
    await prisma.healthInsurer.update({
      where: { id },
      data:  { deletedAt: new Date() },
    })
  }
}
