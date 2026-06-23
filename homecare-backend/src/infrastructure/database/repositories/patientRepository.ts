import { prisma } from '../prismaClient.js'
import { Prisma } from '../../../generated/prisma/client.js'
import type { IPatientRepository, PatientFilters } from '../../../domain/repositories/iPatientRepository.js'
import type { PatientEntity } from '../../../domain/entities/patientEntity.js'
import type { PaginatedResult } from '../../../domain/repositories/iPaginatedResult.js'

export class PatientRepository implements IPatientRepository {
  async findAll({ companyId, page, limit, search, branchId }: PatientFilters): Promise<PaginatedResult<PatientEntity>> {
    const where = {
      companyId,
      deletedAt: null,
      ...(branchId && { branchId }),
      ...(search && {
        OR: [
          { lastName:  { contains: search, mode: 'insensitive' as const } },
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { dni:       { contains: search } },
        ],
      }),
    }

    const [items, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip:    (page - 1) * limit,
        take:    limit,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      }),
      prisma.patient.count({ where }),
    ])

    return { items, total }
  }

  async findById(id: string, companyId: string): Promise<PatientEntity | null> {
    return prisma.patient.findFirst({ where: { id, companyId, deletedAt: null } })
  }

  async findByDni(dni: string, companyId: string): Promise<PatientEntity | null> {
    return prisma.patient.findFirst({ where: { dni, companyId } })
  }

  async create(data: Omit<PatientEntity, 'id' | 'createdAt' | 'deletedAt'>): Promise<PatientEntity> {
    return prisma.patient.create({ data: data as Prisma.PatientUncheckedCreateInput })
  }

  async update(
    id: string,
    data: Partial<Omit<PatientEntity, 'id' | 'companyId' | 'createdAt' | 'deletedAt'>>
  ): Promise<PatientEntity> {
    return prisma.patient.update({
      where: { id },
      data:  data as Prisma.PatientUpdateInput,
    })
  }

  async softDelete(id: string): Promise<void> {
    await prisma.patient.update({
      where: { id },
      data:  { deletedAt: new Date() },
    })
  }
}
