import type { InsurerRateEntity } from '../entities/insurerRateEntity.js'

export interface IInsurerRateRepository {
  findAllByInsurer(healthInsurerId: string, onlyActive?: boolean): Promise<InsurerRateEntity[]>
  findById(id: string, healthInsurerId: string): Promise<InsurerRateEntity | null>
  findDuplicate(healthInsurerId: string, serviceItemId: string, validFrom: Date): Promise<InsurerRateEntity | null>
  create(data: Omit<InsurerRateEntity, 'id' | 'createdAt'>): Promise<InsurerRateEntity>
  update(id: string, data: Partial<Omit<InsurerRateEntity, 'id' | 'healthInsurerId' | 'serviceItemId' | 'createdAt'>>): Promise<InsurerRateEntity>
  delete(id: string): Promise<void>
}
