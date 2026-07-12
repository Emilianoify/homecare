export interface SupplyResponseDto {
  id:            string
  companyId:     string
  code:          string | null
  name:          string
  unit:          string
  purchasePrice: number
  active:        boolean
  createdAt:     string
}

export interface SupplyListResultDto {
  items:      SupplyResponseDto[]
  page:       number
  limit:      number
  total:      number
  totalPages: number
}
