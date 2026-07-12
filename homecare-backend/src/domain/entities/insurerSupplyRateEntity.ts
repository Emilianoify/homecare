export interface InsurerSupplyRateEntity {
  id:              string
  healthInsurerId: string
  supplyId:        string
  agreedPrice:     number
  validFrom:       Date
  validTo:         Date | null
  active:          boolean
  createdAt:       Date
}
