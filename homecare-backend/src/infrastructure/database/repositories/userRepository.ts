import { prisma } from '../prismaClient.js'
import type { IUserRepository } from '../../../domain/repositories/iUserRepository.js'
import type { UserWithRole } from '../../../domain/entities/userEntity.js'

export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<UserWithRole | null> {
    return prisma.user.findUnique({
      where:   { email },
      include: { role: { select: { id: true, name: true } } },
    })
  }

  async findById(id: string): Promise<UserWithRole | null> {
    return prisma.user.findUnique({
      where:   { id },
      include: { role: { select: { id: true, name: true } } },
    })
  }

  async create(data: {
    email:        string
    passwordHash: string
    firstName:    string
    lastName:     string
    roleId:       string
    companyId:    string
    branchId?:    string
  }): Promise<UserWithRole> {
    return prisma.user.create({
      data,
      include: { role: { select: { id: true, name: true } } },
    })
  }

  async createRefreshToken(data: {
    userId:    string
    token:     string
    expiresAt: Date
  }): Promise<void> {
    await prisma.refreshToken.create({ data })
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({ where: { token } })
  }

  async revokeRefreshToken(userId: string, token: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, token },
      data:  { revoked: true },
    })
  }

  async revokeRefreshTokenById(id: string): Promise<void> {
    await prisma.refreshToken.update({
      where: { id },
      data:  { revoked: true },
    })
  }
}
