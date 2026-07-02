export interface BranchResponseDto {
  id:        string
  companyId: string
  name:      string
  address:   string
  city:      string | null
  phone:     string | null
  active:    boolean
  createdAt: string
}
