export interface MedicationEntity {
  id:             string
  internmentId:   string
  prescribedById: string
  name:           string
  dose:           string
  route:          string
  frequency:      string
  startDate:      Date
  endDate:        Date | null
  active:         boolean
  createdAt:      Date
}
