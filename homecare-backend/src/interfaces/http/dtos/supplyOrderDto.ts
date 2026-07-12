export interface SupplyOrderItemResponseDto {
  id:            string
  supplyOrderId: string
  supplyId:      string | null
  description:   string
  quantity:      number
  unitPrice:     number
  subtotal:      number
  createdAt:     string
}

export interface SupplyOrderResponseDto {
  id:                 string
  internmentId:       string
  companyId:          string
  createdById:        string
  budgetId:           string | null
  status:             string
  notes:              string | null
  cancellationReason: string | null
  total:              number
  items:              SupplyOrderItemResponseDto[]
  createdAt:          string
}

export interface SupplyOrderListResultDto {
  items:      SupplyOrderResponseDto[]
  page:       number
  limit:      number
  total:      number
  totalPages: number
}
