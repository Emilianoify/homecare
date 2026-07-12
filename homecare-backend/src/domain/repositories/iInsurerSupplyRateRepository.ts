import type { InsurerSupplyRateEntity } from '../entities/insurerSupplyRateEntity.js'

export interface IInsurerSupplyRateRepository {
  findAllByInsurer(healthInsurerId: string, onlyActive?: boolean): Promise<InsurerSupplyRateEntity[]>
  findById(id: string, healthInsurerId: string): Promise<InsurerSupplyRateEntity | null>
  findDuplicate(healthInsurerId: string, supplyId: string, validFrom: Date): Promise<InsurerSupplyRateEntity | null>
  create(data: Omit<InsurerSupplyRateEntity, 'id' | 'createdAt'>): Promise<InsurerSupplyRateEntity>
  update(id: string, data: Partial<Omit<InsurerSupplyRateEntity, 'id' | 'healthInsurerId' | 'supplyId' | 'createdAt'>>): Promise<InsurerSupplyRateEntity>
  delete(id: string): Promise<void>
}
