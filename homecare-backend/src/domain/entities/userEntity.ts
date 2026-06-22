export interface UserEntity {
  id:           string
  companyId:    string
  branchId:     string | null
  roleId:       string
  email:        string
  passwordHash: string
  firstName:    string
  lastName:     string
  active:       boolean
  createdAt:    Date
  deletedAt:    Date | null
}

export interface RoleEntity {
  id:   string
  name: string
}

export interface UserWithRole extends UserEntity {
  role: RoleEntity
}
