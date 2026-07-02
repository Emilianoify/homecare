import type { BranchEntity } from '../entities/branchEntity.js'

export interface IBranchRepository {
  findAll(companyId: string): Promise<BranchEntity[]>
  findById(id: string, companyId: string): Promise<BranchEntity | null>
  create(data: Omit<BranchEntity, 'id' | 'createdAt' | 'deletedAt'>): Promise<BranchEntity>
  update(id: string, data: Partial<Omit<BranchEntity, 'id' | 'companyId' | 'createdAt' | 'deletedAt'>>): Promise<BranchEntity>
  softDelete(id: string): Promise<void>
}
