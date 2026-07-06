import { prisma } from '../prismaClient.js'
import type { IInsurerRateRepository } from '../../../domain/repositories/iInsurerRateRepository.js'
import type { InsurerRateEntity } from '../../../domain/entities/insurerRateEntity.js'

export class InsurerRateRepository implements IInsurerRateRepository {
  async findAllByInsurer(healthInsurerId: string, onlyActive?: boolean): Promise<InsurerRateEntity[]> {
    const rows = await prisma.insurerServiceRate.findMany({
      where: {
        healthInsurerId,
        ...(onlyActive === true && { active: true }),
      },
      orderBy: [{ serviceItemId: 'asc' }, { validFrom: 'desc' }],
    })
    return rows.map(row => this.toDomain(row))
  }

  async findById(id: string, healthInsurerId: string): Promise<InsurerRateEntity | null> {
    const row = await prisma.insurerServiceRate.findFirst({
      where: { id, healthInsurerId },
    })
    return row ? this.toDomain(row) : null
  }

  async findDuplicate(
    healthInsurerId: string,
    serviceItemId:   string,
    validFrom:       Date
  ): Promise<InsurerRateEntity | null> {
    const row = await prisma.insurerServiceRate.findFirst({
      where: { healthInsurerId, serviceItemId, validFrom },
    })
    return row ? this.toDomain(row) : null
  }

  async create(data: Omit<InsurerRateEntity, 'id' | 'createdAt'>): Promise<InsurerRateEntity> {
    const row = await prisma.insurerServiceRate.create({ data })
    return this.toDomain(row)
  }

  async update(
    id: string,
    data: Partial<Omit<InsurerRateEntity, 'id' | 'healthInsurerId' | 'serviceItemId' | 'createdAt'>>
  ): Promise<InsurerRateEntity> {
    const row = await prisma.insurerServiceRate.update({ where: { id }, data })
    return this.toDomain(row)
  }

  async delete(id: string): Promise<void> {
    await prisma.insurerServiceRate.delete({ where: { id } })
  }

  private toDomain(row: {
    id:              string
    healthInsurerId: string
    serviceItemId:   string
    agreedPrice:     { toNumber(): number }
    validFrom:       Date
    validTo:         Date | null
    active:          boolean
    createdAt:       Date
  }): InsurerRateEntity {
    return {
      id:              row.id,
      healthInsurerId: row.healthInsurerId,
      serviceItemId:   row.serviceItemId,
      agreedPrice:     row.agreedPrice.toNumber(),
      validFrom:       row.validFrom,
      validTo:         row.validTo,
      active:          row.active,
      createdAt:       row.createdAt,
    }
  }
}
