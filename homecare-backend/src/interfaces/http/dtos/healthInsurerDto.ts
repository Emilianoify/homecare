export interface HealthInsurerResponseDto {
  id:             string
  companyId:      string
  name:           string
  acronym:        string
  cuit:           string
  rnos:           string | null
  insurerType:    string
  billingEmail:   string | null
  billingMode:    string
  cutoffDay:      number | null
  paymentDays:    number | null
  requiresPaper:  boolean
  operativeNotes: string | null
  active:         boolean
  createdAt:      string
}

export interface HealthInsurerListResultDto {
  items:      HealthInsurerResponseDto[]
  page:       number
  limit:      number
  total:      number
  totalPages: number
}
