export interface SupplyEntity {
  id:            string
  companyId:     string
  code:          string | null
  name:          string
  unit:          string
  purchasePrice: number
  active:        boolean
  createdAt:     Date
  deletedAt:     Date | null
}
