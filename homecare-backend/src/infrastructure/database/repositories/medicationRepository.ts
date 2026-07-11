import { prisma } from '../prismaClient.js'
import type { IMedicationRepository, MedicationFilters } from '../../../domain/repositories/iMedicationRepository.js'
import type { MedicationEntity } from '../../../domain/entities/medicationEntity.js'

export class MedicationRepository implements IMedicationRepository {
  async findAll({ internmentId, active }: MedicationFilters): Promise<MedicationEntity[]> {
    return prisma.medication.findMany({
      where: {
        internmentId,
        ...(active !== undefined && { active }),
      },
      orderBy: [{ active: 'desc' }, { startDate: 'desc' }],
    })
  }

  async findById(id: string, internmentId: string): Promise<MedicationEntity | null> {
    return prisma.medication.findFirst({
      where: { id, internmentId },
    })
  }

  async create(data: Omit<MedicationEntity, 'id' | 'createdAt'>): Promise<MedicationEntity> {
    return prisma.medication.create({ data })
  }

  async update(
    id: string,
    data: Partial<Omit<MedicationEntity, 'id' | 'internmentId' | 'prescribedById' | 'createdAt'>>
  ): Promise<MedicationEntity> {
    return prisma.medication.update({ where: { id }, data })
  }
}
