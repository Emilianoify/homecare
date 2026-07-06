export interface InsurerRateEntity {
  id:              string
  healthInsurerId: string
  serviceItemId:   string
  agreedPrice:     number
  validFrom:       Date
  validTo:         Date | null
  active:          boolean
  createdAt:       Date
}
