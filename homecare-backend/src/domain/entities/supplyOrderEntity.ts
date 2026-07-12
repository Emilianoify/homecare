export interface SupplyOrderEntity {
  id:                 string
  internmentId:       string
  companyId:          string
  createdById:        string
  budgetId:           string | null
  status:             string
  notes:              string | null
  cancellationReason: string | null
  createdAt:          Date
  items:              SupplyOrderItemEntity[]
}

export interface SupplyOrderItemEntity {
  id:            string
  supplyOrderId: string
  supplyId:      string | null
  description:   string
  quantity:      number
  unitPrice:     number
  createdAt:     Date
}
