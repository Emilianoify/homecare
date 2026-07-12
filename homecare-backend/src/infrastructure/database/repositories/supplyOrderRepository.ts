import { prisma } from '../prismaClient.js'
import type { ISupplyOrderRepository, SupplyOrderFilters } from '../../../domain/repositories/iSupplyOrderRepository.js'
import type { SupplyOrderEntity, SupplyOrderItemEntity } from '../../../domain/entities/supplyOrderEntity.js'
import type { PaginatedResult } from '../../../domain/repositories/iPaginatedResult.js'
import type { SupplyOrderStatus } from '../../../generated/prisma/client.js'

type PrismaOrderWithItems = {
  id:                 string
  internmentId:       string
  companyId:          string
  createdById:        string
  budgetId:           string | null
  status:             SupplyOrderStatus
  notes:              string | null
  cancellationReason: string | null
  createdAt:          Date
  items: {
    id:            string
    supplyOrderId: string
    supplyId:      string | null
    description:   string
    quantity:      number
    unitPrice:     { toNumber(): number }
    createdAt:     Date
  }[]
}

export class SupplyOrderRepository implements ISupplyOrderRepository {
  async findAll({ internmentId, page, limit, status }: SupplyOrderFilters): Promise<PaginatedResult<SupplyOrderEntity>> {
    const where = {
      internmentId,
      ...(status && { status: status as SupplyOrderStatus }),
    }

    const [rows, total] = await Promise.all([
      prisma.supplyOrder.findMany({
        where,
        include: { items: { orderBy: { createdAt: 'asc' } } },
        skip:    (page - 1) * limit,
        take:    limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.supplyOrder.count({ where }),
    ])

    return { items: rows.map(r => this.toDomain(r as PrismaOrderWithItems)), total }
  }

  async findById(id: string, internmentId: string): Promise<SupplyOrderEntity | null> {
    const row = await prisma.supplyOrder.findFirst({
      where:   { id, internmentId },
      include: { items: { orderBy: { createdAt: 'asc' } } },
    })
    return row ? this.toDomain(row as PrismaOrderWithItems) : null
  }

  async create(data: {
    internmentId: string
    companyId:    string
    createdById:  string
    budgetId:     string | null
    notes:        string | null
  }): Promise<SupplyOrderEntity> {
    const row = await prisma.supplyOrder.create({
      data:    { ...data, status: 'DRAFT', cancellationReason: null },
      include: { items: true },
    })
    return this.toDomain(row as PrismaOrderWithItems)
  }

  async updateStatus(
    id:                 string,
    status:             string,
    cancellationReason?: string
  ): Promise<SupplyOrderEntity> {
    const row = await prisma.supplyOrder.update({
      where:   { id },
      data:    { status: status as SupplyOrderStatus, ...(cancellationReason && { cancellationReason }) },
      include: { items: { orderBy: { createdAt: 'asc' } } },
    })
    return this.toDomain(row as PrismaOrderWithItems)
  }

  async addItem(data: {
    supplyOrderId: string
    supplyId:      string | null
    description:   string
    quantity:      number
    unitPrice:     number
  }): Promise<SupplyOrderItemEntity> {
    const row = await prisma.supplyOrderItem.create({ data })
    return this.toDomainItem(row)
  }

  async removeItem(itemId: string, supplyOrderId: string): Promise<void> {
    await prisma.supplyOrderItem.delete({
      where: { id: itemId, supplyOrderId },
    })
  }

  async findItem(itemId: string, supplyOrderId: string): Promise<SupplyOrderItemEntity | null> {
    const row = await prisma.supplyOrderItem.findFirst({
      where: { id: itemId, supplyOrderId },
    })
    return row ? this.toDomainItem(row) : null
  }

  private toDomain(row: PrismaOrderWithItems): SupplyOrderEntity {
    return {
      id:                 row.id,
      internmentId:       row.internmentId,
      companyId:          row.companyId,
      createdById:        row.createdById,
      budgetId:           row.budgetId,
      status:             row.status,
      notes:              row.notes,
      cancellationReason: row.cancellationReason,
      createdAt:          row.createdAt,
      items:              row.items.map(i => this.toDomainItem(i)),
    }
  }

  private toDomainItem(row: {
    id:            string
    supplyOrderId: string
    supplyId:      string | null
    description:   string
    quantity:      number
    unitPrice:     { toNumber(): number }
    createdAt:     Date
  }): SupplyOrderItemEntity {
    return {
      id:            row.id,
      supplyOrderId: row.supplyOrderId,
      supplyId:      row.supplyId,
      description:   row.description,
      quantity:      row.quantity,
      unitPrice:     row.unitPrice.toNumber(),
      createdAt:     row.createdAt,
    }
  }
}
