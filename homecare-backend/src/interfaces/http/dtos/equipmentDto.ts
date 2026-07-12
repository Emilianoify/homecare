export interface EquipmentResponseDto {
  id:           string
  companyId:    string
  branchId:     string
  provider:     string
  name:         string
  serialNumber: string | null
  model:        string | null
  dailyRate:    number
  status:       string
  notes:        string | null
  createdAt:    string
}

export interface EquipmentListResultDto {
  items:      EquipmentResponseDto[]
  page:       number
  limit:      number
  total:      number
  totalPages: number
}
