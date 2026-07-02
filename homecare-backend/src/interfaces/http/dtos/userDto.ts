export interface UserResponseDto {
  id:        string
  companyId: string
  branchId:  string | null
  roleId:    string
  roleName:  string
  email:     string
  firstName: string
  lastName:  string
  fullName:  string
  active:    boolean
  createdAt: string
}

export interface UserListResultDto {
  items:      UserResponseDto[]
  page:       number
  limit:      number
  total:      number
  totalPages: number
}
