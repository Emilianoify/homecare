export interface BranchStockEntity {
  id:           string
  companyId:    string
  branchId:     string
  supplyId:     string
  currentStock: number
  updatedAt:    Date
}
