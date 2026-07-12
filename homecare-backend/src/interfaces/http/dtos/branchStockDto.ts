export interface BranchStockResponseDto {
  id:           string
  companyId:    string
  branchId:     string
  supplyId:     string
  currentStock: number
  updatedAt:    string
}

export interface StockMovementResponseDto {
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
  createdAt:     string
}

export interface StockMovementListResultDto {
  items:      StockMovementResponseDto[]
  page:       number
  limit:      number
  total:      number
  totalPages: number
}
