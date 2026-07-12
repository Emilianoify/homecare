export interface AlertConfigEntity {
  id:            string
  companyId:     string
  triggerType:   string
  thresholdDays: number
  active:        boolean
  notifyRoles:   string[]
  createdAt:     Date
  deletedAt:     Date | null
}
