import { prisma } from '../prismaClient.js'
import type { IBranchRepository } from '../../../domain/repositories/iBranchRepository.js'
import type { BranchEntity } from '../../../domain/entities/branchEntity.js'

export class BranchRepository implements IBranchRepository {
  async findAll(companyId: string): Promise<BranchEntity[]> {
    return prisma.branch.findMany({
      where:   { companyId, deletedAt: null },
      orderBy: { name: 'asc' },
    })
  }

  async findById(id: string, companyId: string): Promise<BranchEntity | null> {
    return prisma.branch.findFirst({
      where: { id, companyId, deletedAt: null },
    })
  }

  async create(data: Omit<BranchEntity, 'id' | 'createdAt' | 'deletedAt'>): Promise<BranchEntity> {
    return prisma.branch.create({ data })
  }

  async update(
    id: string,
    data: Partial<Omit<BranchEntity, 'id' | 'companyId' | 'createdAt' | 'deletedAt'>>
  ): Promise<BranchEntity> {
    return prisma.branch.update({ where: { id }, data })
  }

  async softDelete(id: string): Promise<void> {
    await prisma.branch.update({
      where: { id },
      data:  { deletedAt: new Date() },
    })
  }
}
