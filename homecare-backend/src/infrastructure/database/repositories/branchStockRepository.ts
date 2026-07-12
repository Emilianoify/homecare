import { prisma } from '../prismaClient.js'
import type { IBranchStockRepository, BranchStockItem, StockMovementFilters } from '../../../domain/repositories/iBranchStockRepository.js'
import type { BranchStockEntity } from '../../../domain/entities/branchStockEntity.js'
import type { StockMovementEntity } from '../../../domain/entities/stockMovementEntity.js'
import type { PaginatedResult } from '../../../domain/repositories/iPaginatedResult.js'
import type { StockMovementType } from '../../../generated/prisma/client.js'

export class BranchStockRepository implements IBranchStockRepository {
  async findAll(companyId: string, branchId?: string): Promise<BranchStockEntity[]> {
    const rows = await prisma.branchStock.findMany({
      where: {
        companyId,
        ...(branchId && { branchId }),
      },
      orderBy: { supplyId: 'asc' },
    })
    return rows.map(r => this.toDomain(r))
  }

  async findBySupplyAndBranch(supplyId: string, branchId: string): Promise<BranchStockItem | null> {
    const row = await prisma.branchStock.findFirst({
      where:  { supplyId, branchId },
      select: { currentStock: true },
    })
    if (!row) return null
    return { currentStock: row.currentStock.toNumber() }
  }

  async findOrCreate(supplyId: string, branchId: string, companyId: string): Promise<BranchStockEntity> {
    const row = await prisma.branchStock.upsert({
      where:  { branchId_supplyId: { branchId, supplyId } },
      update: {},
      create: { supplyId, branchId, companyId, currentStock: 0 },
    })
    return this.toDomain(row)
  }

  async getAllowNegative(companyId: string): Promise<boolean> {
    const company = await prisma.company.findUnique({
      where:  { id: companyId },
      select: { allowNegativeStock: true },
    })
    return company?.allowNegativeStock ?? true
  }

  async createMovement(data: Omit<StockMovementEntity, 'id' | 'createdAt'>): Promise<StockMovementEntity> {
    const row = await prisma.stockMovement.create({
      data: {
        companyId:     data.companyId,
        branchId:      data.branchId,
        supplyId:      data.supplyId,
        type:          data.type as StockMovementType,
        quantity:      data.quantity,
        previousStock: data.previousStock,
        newStock:      data.newStock,
        reference:     data.reference,
        notes:         data.notes,
        createdById:   data.createdById,
      }
    })
    return this.toDomainMovement(row)
  }

  async updateStock(supplyId: string, branchId: string, newStock: number): Promise<BranchStockEntity> {
    const row = await prisma.branchStock.update({
      where: { branchId_supplyId: { branchId, supplyId } },
      data:  { currentStock: newStock },
    })
    return this.toDomain(row)
  }

  async listMovements({ companyId, branchId, supplyId, page, limit }: StockMovementFilters): Promise<PaginatedResult<StockMovementEntity>> {
    const where = {
      companyId,
      ...(branchId && { branchId }),
      ...(supplyId && { supplyId }),
    }

    const [rows, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip:    (page - 1) * limit,
        take:    limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.stockMovement.count({ where }),
    ])

    return { items: rows.map(r => this.toDomainMovement(r)), total }
  }

  private toDomain(row: {
    id:           string
    companyId:    string
    branchId:     string
    supplyId:     string
    currentStock: { toNumber(): number }
    updatedAt:    Date
  }): BranchStockEntity {
    return {
      id:           row.id,
      companyId:    row.companyId,
      branchId:     row.branchId,
      supplyId:     row.supplyId,
      currentStock: row.currentStock.toNumber(),
      updatedAt:    row.updatedAt,
    }
  }

  private toDomainMovement(row: {
    id:            string
    companyId:     string
    branchId:      string
    supplyId:      string
    type:          StockMovementType
    quantity:      number
    previousStock: { toNumber(): number }
    newStock:      { toNumber(): number }
    reference:     string | null
    notes:         string | null
    createdById:   string
    createdAt:     Date
  }): StockMovementEntity {
    return {
      id:            row.id,
      companyId:     row.companyId,
      branchId:      row.branchId,
      supplyId:      row.supplyId,
      type:          row.type,
      quantity:      row.quantity,
      previousStock: row.previousStock.toNumber(),
      newStock:      row.newStock.toNumber(),
      reference:     row.reference,
      notes:         row.notes,
      createdById:   row.createdById,
      createdAt:     row.createdAt,
    }
  }
}
