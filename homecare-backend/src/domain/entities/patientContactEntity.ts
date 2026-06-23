export interface PatientContactEntity {
  id:                 string
  patientId:          string
  name:               string
  relationship:       string
  phone:              string
  phoneAlternative:   string | null
  email:              string | null
  livesAtCareAddress: boolean
  availabilityHours:  string | null
  isPrimary:          boolean
  createdAt:          Date
}
