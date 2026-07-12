export interface EquipmentEntity {
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
  createdAt:    Date
  deletedAt:    Date | null
}
