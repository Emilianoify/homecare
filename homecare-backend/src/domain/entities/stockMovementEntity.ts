export interface StockMovementEntity {
  id:            string
  companyId:     string
  branchId:      string
  supplyId:      string
  type:          string
  quantity:      number
  previousStock: number
  newStock:      number
  reference:     string | null
  notes:         string | null
  createdById:   string
  createdAt:     Date
}
