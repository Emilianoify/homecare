import { prisma } from '../prismaClient.js'
import type { IEquipmentRentalRepository, EquipmentRentalFilters } from '../../../domain/repositories/iEquipmentRentalRepository.js'
import type { EquipmentRentalEntity } from '../../../domain/entities/equipmentRentalEntity.js'

export class EquipmentRentalRepository implements IEquipmentRentalRepository {
  async findAll({ internmentId, onlyActive }: EquipmentRentalFilters): Promise<EquipmentRentalEntity[]> {
    const rows = await prisma.equipmentRental.findMany({
      where: {
        internmentId,
        ...(onlyActive === true && { endDate: null }),
      },
      orderBy: [{ endDate: 'asc' }, { startDate: 'desc' }],
    })
    return rows.map(r => this.toDomain(r))
  }

  async findById(id: string, internmentId: string): Promise<EquipmentRentalEntity | null> {
    const row = await prisma.equipmentRental.findFirst({
      where: { id, internmentId },
    })
    return row ? this.toDomain(row) : null
  }

  async findActiveByEquipment(equipmentId: string): Promise<EquipmentRentalEntity | null> {
    const row = await prisma.equipmentRental.findFirst({
      where: { equipmentId, endDate: null },
    })
    return row ? this.toDomain(row) : null
  }

  async findAuthorizationByIdAndInternment(
    authorizationId: string,
    internmentId:    string
  ): Promise<{ id: string } | null> {
    return prisma.authorization.findFirst({
      where:  { id: authorizationId, internmentId },
      select: { id: true },
    })
  }

  async create(data: Omit<EquipmentRentalEntity, 'id' | 'createdAt'>): Promise<EquipmentRentalEntity> {
    const row = await prisma.equipmentRental.create({
      data: {
        internmentId:    data.internmentId,
        equipmentId:     data.equipmentId,
        authorizationId: data.authorizationId,
        budgetId:        data.budgetId,
        monthlyRate:     data.monthlyRate,
        startDate:       data.startDate,
        endDate:         data.endDate,
        closedReason:    data.closedReason,
        billedToInsurer: data.billedToInsurer,
      }
    })
    return this.toDomain(row)
  }

  async close(id: string, endDate: Date, closedReason: string): Promise<EquipmentRentalEntity> {
    const row = await prisma.equipmentRental.update({
      where: { id },
      data:  { endDate, closedReason },
    })
    return this.toDomain(row)
  }

  private toDomain(row: {
    id:              string
    internmentId:    string
    equipmentId:     string
    authorizationId: string | null
    budgetId:        string | null
    monthlyRate:     { toNumber(): number }
    startDate:       Date
    endDate:         Date | null
    closedReason:    string | null
    billedToInsurer: boolean
    createdAt:       Date
  }): EquipmentRentalEntity {
    return {
      id:              row.id,
      internmentId:    row.internmentId,
      equipmentId:     row.equipmentId,
      authorizationId: row.authorizationId,
      budgetId:        row.budgetId,
      monthlyRate:     row.monthlyRate.toNumber(),
      startDate:       row.startDate,
      endDate:         row.endDate,
      closedReason:    row.closedReason,
      billedToInsurer: row.billedToInsurer,
      createdAt:       row.createdAt,
    }
  }
}
