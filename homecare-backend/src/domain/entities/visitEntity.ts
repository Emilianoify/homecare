export interface VisitEntity {
  id:              string
  carePlanId:      string
  professionalId:  string
  internmentId:    string
  completedAt:     Date
  status:          string
  missedReason:    string | null
  lat:             number | null
  lng:             number | null
  billed:          boolean
  notes:           string | null
  createdAt:       Date
}
