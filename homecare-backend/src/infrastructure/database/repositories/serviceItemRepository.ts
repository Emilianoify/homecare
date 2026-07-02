import { prisma } from '../prismaClient.js'
import type { IServiceItemRepository, ServiceItemFilters } from '../../../domain/repositories/iServiceItemRepository.js'
import type { ServiceItemEntity } from '../../../domain/entities/serviceItemEntity.js'
import type { PaginatedResult } from '../../../domain/repositories/iPaginatedResult.js'
import { Prisma } from '../../../generated/prisma/client.js'

export class ServiceItemRepository implements IServiceItemRepository {
  async findAll({ page, limit, search, specialty, active }: ServiceItemFilters): Promise<PaginatedResult<ServiceItemEntity>> {
    const where = {
      deletedAt: null,
      ...(specialty            && { specialty: specialty as Prisma.EnumSpecialtyFilter }),
      ...(active !== undefined && { active }),
      ...(search && {
        OR: [
          { code:        { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [rows, total] = await Promise.all([
      prisma.serviceItem.findMany({
        where,
        skip:    (page - 1) * limit,
        take:    limit,
        orderBy: [{ specialty: 'asc' }, { code: 'asc' }],
      }),
      prisma.serviceItem.count({ where }),
    ])

    return { items: rows.map(row => this.toDomain(row)), total }
  }

  async findById(id: string): Promise<ServiceItemEntity | null> {
    const row = await prisma.serviceItem.findFirst({ where: { id, deletedAt: null } })
    return row ? this.toDomain(row) : null
  }

  async findByCode(code: string): Promise<ServiceItemEntity | null> {
    const row = await prisma.serviceItem.findFirst({ where: { code, deletedAt: null } })
    return row ? this.toDomain(row) : null
  }

  async create(data: Omit<ServiceItemEntity, 'id' | 'createdAt' | 'deletedAt'>): Promise<ServiceItemEntity> {
    const row = await prisma.serviceItem.create({
      data: {
        ...data,
        basePrice: new Prisma.Decimal(data.basePrice),
      } as Prisma.ServiceItemUncheckedCreateInput,
    })
    return this.toDomain(row)
  }

  async update(
    id: string,
    data: Partial<Omit<ServiceItemEntity, 'id' | 'createdAt' | 'deletedAt'>>
  ): Promise<ServiceItemEntity> {
    const row = await prisma.serviceItem.update({
      where: { id },
      data: {
        ...data,
        ...(data.basePrice !== undefined && { basePrice: new Prisma.Decimal(data.basePrice) }),
      } as Prisma.ServiceItemUpdateInput,
    })
    return this.toDomain(row)
  }

  async softDelete(id: string): Promise<void> {
    await prisma.serviceItem.update({
      where: { id },
      data:  { deletedAt: new Date() },
    })
  }

  private toDomain(row: {
    id:          string
    specialty:   string
    code:        string
    description: string
    billingMode: string
    basePrice:   Prisma.Decimal
    active:      boolean
    createdAt:   Date
    deletedAt:   Date | null
  }): ServiceItemEntity {
    return {
      id:          row.id,
      specialty:   row.specialty,
      code:        row.code,
      description: row.description,
      billingMode: row.billingMode,
      basePrice:   row.basePrice.toNumber(),
      active:      row.active,
      createdAt:   row.createdAt,
      deletedAt:   row.deletedAt,
    }
  }
}
