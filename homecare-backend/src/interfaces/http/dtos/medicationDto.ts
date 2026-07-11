export interface MedicationResponseDto {
  id:             string
  internmentId:   string
  prescribedById: string
  name:           string
  dose:           string
  route:          string
  frequency:      string
  startDate:      string
  endDate:        string | null
  active:         boolean
  createdAt:      string
}
