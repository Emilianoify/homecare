import { prisma } from '../prismaClient.js'
import { Prisma } from '../../../generated/prisma/client.js'
import type { IInternmentRepository, InternmentFilters } from '../../../domain/repositories/iInternmentRepository.js'
import type { InternmentEntity } from '../../../domain/entities/internmentEntity.js'
import type { PaginatedResult } from '../../../domain/repositories/iPaginatedResult.js'

export class InternmentRepository implements IInternmentRepository {
  async findAll({ page, limit, status, patientId, healthInsurerId, branchId }: InternmentFilters): Promise<PaginatedResult<InternmentEntity>> {
    const where = {
      deletedAt: null,
      ...(status && status !== 'all' && { status: status as Prisma.EnumInternmentStatusFilter }),
      ...(patientId       && { patientId }),
      ...(healthInsurerId && { healthInsurerId }),
      ...(branchId        && { branchId }),
    }

    const [items, total] = await Promise.all([
      prisma.internment.findMany({
        where,
        skip:    (page - 1) * limit,
        take:    limit,
        orderBy: { admissionDate: 'desc' },
      }),
      prisma.internment.count({ where }),
    ])

    return { items: items as InternmentEntity[], total }
  }

  async findById(id: string): Promise<InternmentEntity | null> {
    const result = await prisma.internment.findFirst({ where: { id, deletedAt: null } })
    return result as InternmentEntity | null
  }

  async findActiveByPatient(patientId: string): Promise<InternmentEntity | null> {
    const result = await prisma.internment.findFirst({
      where: { patientId, status: 'ACTIVE', deletedAt: null },
    })
    return result as InternmentEntity | null
  }

  async create(data: Omit<InternmentEntity, 'id' | 'createdAt' | 'deletedAt'>): Promise<InternmentEntity> {
    const result = await prisma.internment.create({ data: data as Prisma.InternmentUncheckedCreateInput })
    return result as InternmentEntity
  }

  async update(
    id: string,
    data: Partial<Omit<InternmentEntity, 'id' | 'createdAt' | 'deletedAt'>>
  ): Promise<InternmentEntity> {
    const result = await prisma.internment.update({
      where: { id },
      data:  data as Prisma.InternmentUpdateInput,
    })
    return result as InternmentEntity
  }

  async softDelete(id: string): Promise<void> {
    await prisma.internment.update({
      where: { id },
      data:  { deletedAt: new Date() },
    })
  }

  async findVisitByIdAndInternment(
    visitId:      string,
    internmentId: string
  ): Promise<{ id: string } | null> {
    return prisma.visit.findFirst({
      where:  { id: visitId, internmentId },
      select: { id: true },
    })
  }
}
