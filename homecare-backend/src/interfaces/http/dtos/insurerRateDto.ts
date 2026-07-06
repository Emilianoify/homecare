export interface InsurerRateResponseDto {
  id:              string
  healthInsurerId: string
  serviceItemId:   string
  agreedPrice:     number
  validFrom:       string
  validTo:         string | null
  active:          boolean
  createdAt:       string
}
