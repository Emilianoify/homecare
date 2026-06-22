export interface UserResponseDto {
  id:        string
  email:     string
  firstName: string
  lastName:  string
  roleId:    string
  roleName:  string
  companyId: string
  branchId:  string | null
}
