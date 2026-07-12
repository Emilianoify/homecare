export interface InsurerSupplyRateResponseDto {
  id:              string
  healthInsurerId: string
  supplyId:        string
  agreedPrice:     number
  validFrom:       string
  validTo:         string | null
  active:          boolean
  createdAt:       string
}
