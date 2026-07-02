export interface ServiceItemResponseDto {
  id:          string
  specialty:   string
  code:        string
  description: string
  billingMode: string
  basePrice:   number
  active:      boolean
  createdAt:   string
}

export interface ServiceItemListResultDto {
  items:      ServiceItemResponseDto[]
  page:       number
  limit:      number
  total:      number
  totalPages: number
}
