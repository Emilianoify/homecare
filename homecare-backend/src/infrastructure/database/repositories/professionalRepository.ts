import { prisma } from '../prismaClient.js'
import { Prisma } from '../../../generated/prisma/client.js'
import type { IProfessionalRepository, ProfessionalFilters } from '../../../domain/repositories/iProfessionalRepository.js'
import type { ProfessionalEntity } from '../../../domain/entities/professionalEntity.js'
import type { PaginatedResult } from '../../../domain/repositories/iPaginatedResult.js'

export class ProfessionalRepository implements IProfessionalRepository {
  async findAll({ companyId, page, limit, search, specialty, active }: ProfessionalFilters): Promise<PaginatedResult<ProfessionalEntity>> {
    const where = {
      companyId,
      deletedAt: null,
      ...(specialty            && { specialty: specialty as Prisma.EnumSpecialtyFilter }),
      ...(active !== undefined && { active }),
      ...(search && {
        OR: [
          { lastName:  { contains: search, mode: 'insensitive' as const } },
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { dni:       { contains: search } },
        ],
      }),
    }

    const [items, total] = await Promise.all([
      prisma.professional.findMany({
        where,
        skip:    (page - 1) * limit,
        take:    limit,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      }),
      prisma.professional.count({ where }),
    ])

    return { items: items as ProfessionalEntity[], total }
  }

  async findById(id: string, companyId: string): Promise<ProfessionalEntity | null> {
    const result = await prisma.professional.findFirst({ where: { id, companyId, deletedAt: null } })
    return result as ProfessionalEntity | null
  }

  async findByCuit(cuit: string, companyId: string): Promise<ProfessionalEntity | null> {
    const result = await prisma.professional.findFirst({ where: { cuit, companyId } })
    return result as ProfessionalEntity | null
  }

  async create(data: Omit<ProfessionalEntity, 'id' | 'createdAt' | 'deletedAt'>): Promise<ProfessionalEntity> {
    const result = await prisma.professional.create({ data: data as Prisma.ProfessionalUncheckedCreateInput })
    return result as ProfessionalEntity
  }

  async update(
    id: string,
    data: Partial<Omit<ProfessionalEntity, 'id' | 'companyId' | 'createdAt' | 'deletedAt'>>
  ): Promise<ProfessionalEntity> {
    const result = await prisma.professional.update({
      where: { id },
      data:  data as Prisma.ProfessionalUpdateInput,
    })
    return result as ProfessionalEntity
  }

  async softDelete(id: string): Promise<void> {
    await prisma.professional.update({
      where: { id },
      data:  { deletedAt: new Date() },
    })
  }
}
