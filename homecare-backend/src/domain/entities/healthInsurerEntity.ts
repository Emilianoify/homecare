export interface HealthInsurerEntity {
  id:             string
  companyId:      string
  name:           string
  acronym:        string
  cuit:           string
  rnos:           string | null
  insurerType:    'NATIONAL_INSURANCE' | 'PROVINCIAL_INSURANCE' | 'PREPAID' | 'PRIVATE'
  billingEmail:   string | null
  billingMode:    'PER_VISIT' | 'DAILY_MODULE' | 'MIXED'
  cutoffDay:      number | null
  paymentDays:    number | null
  requiresPaper:  boolean
  operativeNotes: string | null
  active:         boolean
  createdAt:      Date
  deletedAt:      Date | null
}
