export interface ServiceItemEntity {
  id:          string
  specialty:   string
  code:        string
  description: string
  billingMode: string
  basePrice:   number
  active:      boolean
  createdAt:   Date
  deletedAt:   Date | null
}
