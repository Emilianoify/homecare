import { prisma } from '../prismaClient.js'
import type { IEquipmentRepository, EquipmentFilters } from '../../../domain/repositories/iEquipmentRepository.js'
import type { EquipmentEntity } from '../../../domain/entities/equipmentEntity.js'
import type { PaginatedResult } from '../../../domain/repositories/iPaginatedResult.js'
import { EquipmentStatus } from '../../../generated/prisma/enums.js'

export class EquipmentRepository implements IEquipmentRepository {
  async findAll({ companyId, page, limit, branchId, status, search }: EquipmentFilters): Promise<PaginatedResult<EquipmentEntity>> {
    const where = {
      companyId,
      deletedAt: null,
      ...(branchId && { branchId }),
      ...(status   && { status: status as EquipmentStatus }),
      ...(search && {
        OR: [
          { name:         { contains: search, mode: 'insensitive' as const } },
          { provider:     { contains: search, mode: 'insensitive' as const } },
          { serialNumber: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [rows, total] = await Promise.all([
      prisma.equipment.findMany({
        where,
        skip:    (page - 1) * limit,
        take:    limit,
        orderBy: [{ status: 'asc' }, { name: 'asc' }],
      }),
      prisma.equipment.count({ where }),
    ])

    return { items: rows.map(r => this.toDomain(r)), total }
  }

  async findById(id: string, companyId: string): Promise<EquipmentEntity | null> {
    const row = await prisma.equipment.findFirst({
      where: { id, companyId, deletedAt: null },
    })
    return row ? this.toDomain(row) : null
  }

  async create(data: Omit<EquipmentEntity, 'id' | 'createdAt' | 'deletedAt'>): Promise<EquipmentEntity> {
    const row = await prisma.equipment.create({
      data: {
        companyId:    data.companyId,
        branchId:     data.branchId,
        provider:     data.provider,
        name:         data.name,
        model:        data.model,
        serialNumber: data.serialNumber,
        dailyRate:    data.dailyRate,
        status:       data.status as EquipmentStatus,
        notes:        data.notes,
      }
    })
    return this.toDomain(row)
  }

  async update(
    id: string,
    data: Partial<Omit<EquipmentEntity, 'id' | 'companyId' | 'createdAt' | 'deletedAt'>>
  ): Promise<EquipmentEntity> {
    const row = await prisma.equipment.update({
      where: { id },
      data: {
        branchId:     data.branchId,
        provider:     data.provider,
        name:         data.name,
        model:        data.model,
        serialNumber: data.serialNumber,
        dailyRate:    data.dailyRate,
        status:       data.status as EquipmentStatus | undefined,
        notes:        data.notes,
      }
    })
    return this.toDomain(row)
  }

  async updateStatus(id: string, status: string): Promise<EquipmentEntity> {
    const row = await prisma.equipment.update({
      where: { id },
      data: { status: status as EquipmentStatus }
    })
    return this.toDomain(row)
  }

  async softDelete(id: string): Promise<void> {
    await prisma.equipment.update({
      where: { id },
      data:  { deletedAt: new Date() },
    })
  }

  // dailyRate viene de Prisma como Decimal — convertir a number
  private toDomain(row: {
    id:           string
    companyId:    string
    branchId:     string
    provider:     string
    name:         string
    serialNumber: string | null
    model:        string | null
    dailyRate:    { toNumber(): number }
    status:       EquipmentStatus
    notes:        string | null
    createdAt:    Date
    deletedAt:    Date | null
  }): EquipmentEntity {
    return {
      id:           row.id,
      companyId:    row.companyId,
      branchId:     row.branchId,
      provider:     row.provider,
      name:         row.name,
      serialNumber: row.serialNumber,
      model:        row.model,
      dailyRate:    row.dailyRate.toNumber(),
      status:       row.status,
      notes:        row.notes,
      createdAt:    row.createdAt,
      deletedAt:    row.deletedAt,
    }
  }
}
