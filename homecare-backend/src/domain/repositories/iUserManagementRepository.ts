import type { UserWithRole } from '../entities/userEntity.js'
import type { PaginatedResult } from './iPaginatedResult.js'

export interface UserFilters {
  companyId: string
  page:      number
  limit:     number
  search?:   string
  roleId?:   string
  active?:   boolean
}

export interface IUserManagementRepository {
  findAll(filters: UserFilters): Promise<PaginatedResult<UserWithRole>>
  findById(id: string, companyId: string): Promise<UserWithRole | null>
  findByEmail(email: string): Promise<UserWithRole | null>
  create(data: {
    companyId:    string
    branchId?:    string
    roleId:       string
    email:        string
    passwordHash: string
    firstName:    string
    lastName:     string
    active:       boolean
  }): Promise<UserWithRole>
  update(id: string, data: {
    branchId?:  string | null
    roleId?:    string
    firstName?: string
    lastName?:  string
    active?:    boolean
  }): Promise<UserWithRole>
  updatePassword(id: string, passwordHash: string): Promise<void>
  softDelete(id: string): Promise<void>
}
