import { prisma } from '../prismaClient.js'
import { Prisma } from '../../../generated/prisma/client.js'
import type { IPatientContactRepository } from '../../../domain/repositories/iPatientContactRepository.js'
import type { PatientContactEntity } from '../../../domain/entities/patientContactEntity.js'

export class PatientContactRepository implements IPatientContactRepository {
  async findAllByPatient(patientId: string): Promise<PatientContactEntity[]> {
    const result = await prisma.patientContact.findMany({
      where:   { patientId },
      orderBy: [{ isPrimary: 'desc' }, { name: 'asc' }],
    })
    return result as PatientContactEntity[]
  }

  async findById(id: string, patientId: string): Promise<PatientContactEntity | null> {
    const result = await prisma.patientContact.findFirst({ where: { id, patientId } })
    return result as PatientContactEntity | null
  }

  async findPrimaryByPatient(patientId: string): Promise<PatientContactEntity | null> {
    const result = await prisma.patientContact.findFirst({ where: { patientId, isPrimary: true } })
    return result as PatientContactEntity | null
  }

  async clearPrimaryByPatient(patientId: string): Promise<void> {
    await prisma.patientContact.updateMany({
      where: { patientId, isPrimary: true },
      data:  { isPrimary: false },
    })
  }

  async create(data: Omit<PatientContactEntity, 'id' | 'createdAt'>): Promise<PatientContactEntity> {
    const result = await prisma.patientContact.create({ data: data as Prisma.PatientContactUncheckedCreateInput })
    return result as PatientContactEntity
  }

  async update(
    id: string,
    data: Partial<Omit<PatientContactEntity, 'id' | 'patientId' | 'createdAt'>>
  ): Promise<PatientContactEntity> {
    const result = await prisma.patientContact.update({
      where: { id },
      data:  data as Prisma.PatientContactUpdateInput,
    })
    return result as PatientContactEntity
  }

  async delete(id: string): Promise<void> {
    await prisma.patientContact.delete({ where: { id } })
  }
}
