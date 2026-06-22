import type { UserWithRole } from '../entities/userEntity.js'

export interface IUserRepository {
  findByEmail(email: string): Promise<UserWithRole | null>
  findById(id: string): Promise<UserWithRole | null>
  create(data: {
    email:        string
    passwordHash: string
    firstName:    string
    lastName:     string
    roleId:       string
    companyId:    string
    branchId?:    string
  }): Promise<UserWithRole>
  createRefreshToken(data: {
    userId:    string
    token:     string
    expiresAt: Date
  }): Promise<void>
  findRefreshToken(token: string): Promise<{
    id:        string
    userId:    string
    revoked:   boolean
    expiresAt: Date
  } | null>
  revokeRefreshToken(userId: string, token: string): Promise<void>
  revokeRefreshTokenById(id: string): Promise<void>
}
