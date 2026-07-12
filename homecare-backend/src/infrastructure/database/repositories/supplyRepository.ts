import { prisma } from '../prismaClient.js'
import type { ISupplyRepository, SupplyFilters } from '../../../domain/repositories/iSupplyRepository.js'
import type { SupplyEntity } from '../../../domain/entities/supplyEntity.js'
import type { PaginatedResult } from '../../../domain/repositories/iPaginatedResult.js'

export class SupplyRepository implements ISupplyRepository {
  async findAll({ companyId, page, limit, search, active }: SupplyFilters): Promise<PaginatedResult<SupplyEntity>> {
    const where = {
      companyId,
      deletedAt: null,
      ...(active !== undefined && { active }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { code: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [rows, total] = await Promise.all([
      prisma.supply.findMany({
        where,
        skip:    (page - 1) * limit,
        take:    limit,
        orderBy: { name: 'asc' },
      }),
      prisma.supply.count({ where }),
    ])

    return { items: rows.map(r => this.toDomain(r)), total }
  }

  async findById(id: string, companyId: string): Promise<SupplyEntity | null> {
    const row = await prisma.supply.findFirst({
      where: { id, companyId, deletedAt: null },
    })
    return row ? this.toDomain(row) : null
  }

  async findByCode(code: string, companyId: string): Promise<SupplyEntity | null> {
    const row = await prisma.supply.findFirst({
      where: { code, companyId, deletedAt: null },
    })
    return row ? this.toDomain(row) : null
  }

  async create(data: Omit<SupplyEntity, 'id' | 'createdAt' | 'deletedAt'>): Promise<SupplyEntity> {
    const row = await prisma.supply.create({
      data: {
        companyId:     data.companyId,
        code:          data.code,
        name:          data.name,
        unit:          data.unit,
        purchasePrice: data.purchasePrice,
        active:        data.active,
      }
    })
    return this.toDomain(row)
  }

  async update(
    id:   string,
    data: Partial<Omit<SupplyEntity, 'id' | 'companyId' | 'createdAt' | 'deletedAt'>>
  ): Promise<SupplyEntity> {
    const row = await prisma.supply.update({
      where: { id },
      data: {
        code:          data.code,
        name:          data.name,
        unit:          data.unit,
        purchasePrice: data.purchasePrice,
        active:        data.active,
      }
    })
    return this.toDomain(row)
  }

  async softDelete(id: string): Promise<void> {
    await prisma.supply.update({ where: { id }, data: { deletedAt: new Date() } })
  }

  private toDomain(row: {
    id:            string
    companyId:     string
    code:          string | null
    name:          string
    unit:          string
    purchasePrice: { toNumber(): number }
    active:        boolean
    createdAt:     Date
    deletedAt:     Date | null
  }): SupplyEntity {
    return {
      id:            row.id,
      companyId:     row.companyId,
      code:          row.code,
      name:          row.name,
      unit:          row.unit,
      purchasePrice: row.purchasePrice.toNumber(),
      active:        row.active,
      createdAt:     row.createdAt,
      deletedAt:     row.deletedAt,
    }
  }
}
