export interface AlertConfigResponseDto {
  id:            string
  companyId:     string
  triggerType:   string
  thresholdDays: number
  active:        boolean
  notifyRoles:   string[]
  createdAt:     string
}
