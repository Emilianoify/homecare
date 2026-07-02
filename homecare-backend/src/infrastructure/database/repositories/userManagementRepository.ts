import { prisma } from '../prismaClient.js'
import type { IUserManagementRepository, UserFilters } from '../../../domain/repositories/iUserManagementRepository.js'
import type { UserWithRole } from '../../../domain/entities/userEntity.js'
import type { PaginatedResult } from '../../../domain/repositories/iPaginatedResult.js'

const ROLE_SELECT = { select: { id: true, name: true } }

export class UserManagementRepository implements IUserManagementRepository {
  async findAll({ companyId, page, limit, search, roleId, active }: UserFilters): Promise<PaginatedResult<UserWithRole>> {
    const where = {
      companyId,
      deletedAt: null,
      ...(roleId             && { roleId }),
      ...(active !== undefined && { active }),
      ...(search && {
        OR: [
          { lastName:  { contains: search, mode: 'insensitive' as const } },
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { email:     { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { role: ROLE_SELECT },
        skip:    (page - 1) * limit,
        take:    limit,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      }),
      prisma.user.count({ where }),
    ])

    return { items, total }
  }

  async findById(id: string, companyId: string): Promise<UserWithRole | null> {
    return prisma.user.findFirst({
      where:   { id, companyId, deletedAt: null },
      include: { role: ROLE_SELECT },
    })
  }

  async findByEmail(email: string): Promise<UserWithRole | null> {
    return prisma.user.findUnique({
      where:   { email },
      include: { role: ROLE_SELECT },
    })
  }

  async create(data: {
    companyId:    string
    branchId?:    string
    roleId:       string
    email:        string
    passwordHash: string
    firstName:    string
    lastName:     string
    active:       boolean
  }): Promise<UserWithRole> {
    return prisma.user.create({
      data,
      include: { role: ROLE_SELECT },
    })
  }

  async update(id: string, data: {
    branchId?:  string | null
    roleId?:    string
    firstName?: string
    lastName?:  string
    active?:    boolean
  }): Promise<UserWithRole> {
    return prisma.user.update({
      where:   { id },
      data,
      include: { role: ROLE_SELECT },
    })
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data:  { passwordHash },
    })
  }

  async softDelete(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data:  { deletedAt: new Date() },
    })
  }
}
