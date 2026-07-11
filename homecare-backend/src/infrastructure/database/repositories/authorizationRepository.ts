import { prisma } from '../prismaClient.js'
import { Prisma } from '../../../generated/prisma/client.js'
import type { IAuthorizationRepository } from '../../../domain/repositories/iAuthorizationRepository.js'
import type { AuthorizationEntity } from '../../../domain/entities/authorizationEntity.js'

export class AuthorizationRepository implements IAuthorizationRepository {
  async findAllByInternment(internmentId: string): Promise<AuthorizationEntity[]> {
    const rows = await prisma.authorization.findMany({
      where:   { internmentId },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map(row => this.toDomain(row))
  }

  async findById(id: string, internmentId: string): Promise<AuthorizationEntity | null> {
    const row = await prisma.authorization.findFirst({
      where: { id, internmentId },
    })
    return row ? this.toDomain(row) : null
  }

  async create(data: Omit<AuthorizationEntity, 'id' | 'createdAt'>): Promise<AuthorizationEntity> {
    const row = await prisma.authorization.create({
      data: {
        ...data,
        authorizedModules: data.authorizedModules as Prisma.InputJsonValue,
      } as Prisma.AuthorizationUncheckedCreateInput,
    })
    return this.toDomain(row)
  }

  async updateStatus(id: string, status: string): Promise<AuthorizationEntity> {
    const row = await prisma.authorization.update({
      where: { id },
      data:  { status } as Prisma.AuthorizationUncheckedUpdateInput,
    })
    return this.toDomain(row)
  }

  private toDomain(row: {
    id:                string
    internmentId:      string
    healthInsurerId:   string
    number:            string
    opNumber:          string | null
    type:              string
    validFrom:         Date
    validTo:           Date
    authorizedModules: Prisma.JsonValue
    status:            string
    notes:             string | null
    createdAt:         Date
  }): AuthorizationEntity {
    return {
      id:                row.id,
      internmentId:      row.internmentId,
      healthInsurerId:   row.healthInsurerId,
      number:            row.number,
      opNumber:          row.opNumber,
      type:              row.type,
      validFrom:         row.validFrom,
      validTo:           row.validTo,
      authorizedModules: row.authorizedModules as string[],
      status:            row.status,
      notes:             row.notes,
      createdAt:         row.createdAt,
    }
  }
}
