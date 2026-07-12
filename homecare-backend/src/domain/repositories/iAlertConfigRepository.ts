import type { AlertConfigEntity } from '../entities/alertConfigEntity.js'

export interface IAlertConfigRepository {
  findAll(companyId: string, onlyActive?: boolean): Promise<AlertConfigEntity[]>
  findById(id: string, companyId: string): Promise<AlertConfigEntity | null>
  findActiveByTriggerType(triggerType: string, companyId: string): Promise<AlertConfigEntity | null>
  create(data: Omit<AlertConfigEntity, 'id' | 'createdAt' | 'deletedAt'>): Promise<AlertConfigEntity>
  update(id: string, data: Partial<Omit<AlertConfigEntity, 'id' | 'companyId' | 'createdAt' | 'deletedAt'>>): Promise<AlertConfigEntity>
  softDelete(id: string): Promise<void>
}
