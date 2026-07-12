import { prisma } from '../prismaClient.js'
import type { IInsurerSupplyRateRepository } from '../../../domain/repositories/iInsurerSupplyRateRepository.js'
import type { InsurerSupplyRateEntity } from '../../../domain/entities/insurerSupplyRateEntity.js'

export class InsurerSupplyRateRepository implements IInsurerSupplyRateRepository {
  async findAllByInsurer(healthInsurerId: string, onlyActive?: boolean): Promise<InsurerSupplyRateEntity[]> {
    const rows = await prisma.insurerSupplyRate.findMany({
      where: {
        healthInsurerId,
        ...(onlyActive === true && { active: true }),
      },
      orderBy: [{ supplyId: 'asc' }, { validFrom: 'desc' }],
    })
    return rows.map(r => this.toDomain(r))
  }

  async findById(id: string, healthInsurerId: string): Promise<InsurerSupplyRateEntity | null> {
    const row = await prisma.insurerSupplyRate.findFirst({ where: { id, healthInsurerId } })
    return row ? this.toDomain(row) : null
  }

  async findDuplicate(
    healthInsurerId: string,
    supplyId:        string,
    validFrom:       Date
  ): Promise<InsurerSupplyRateEntity | null> {
    const row = await prisma.insurerSupplyRate.findFirst({
      where: { healthInsurerId, supplyId, validFrom },
    })
    return row ? this.toDomain(row) : null
  }

  async create(data: Omit<InsurerSupplyRateEntity, 'id' | 'createdAt'>): Promise<InsurerSupplyRateEntity> {
    const row = await prisma.insurerSupplyRate.create({
      data: {
        healthInsurerId: data.healthInsurerId,
        supplyId:        data.supplyId,
        agreedPrice:     data.agreedPrice,
        validFrom:       data.validFrom,
        validTo:         data.validTo,
        active:          data.active,
      }
    })
    return this.toDomain(row)
  }

  async update(
    id:   string,
    data: Partial<Omit<InsurerSupplyRateEntity, 'id' | 'healthInsurerId' | 'supplyId' | 'createdAt'>>
  ): Promise<InsurerSupplyRateEntity> {
    const row = await prisma.insurerSupplyRate.update({
      where: { id },
      data: {
        agreedPrice: data.agreedPrice,
        validTo:     data.validTo,
        active:      data.active,
      }
    })
    return this.toDomain(row)
  }

  async delete(id: string): Promise<void> {
    await prisma.insurerSupplyRate.delete({ where: { id } })
  }

  private toDomain(row: {
    id:              string
    healthInsurerId: string
    supplyId:        string
    agreedPrice:     { toNumber(): number }
    validFrom:       Date
    validTo:         Date | null
    active:          boolean
    createdAt:       Date
  }): InsurerSupplyRateEntity {
    return {
      id:              row.id,
      healthInsurerId: row.healthInsurerId,
      supplyId:        row.supplyId,
      agreedPrice:     row.agreedPrice.toNumber(),
      validFrom:       row.validFrom,
      validTo:         row.validTo,
      active:          row.active,
      createdAt:       row.createdAt,
    }
  }
}
