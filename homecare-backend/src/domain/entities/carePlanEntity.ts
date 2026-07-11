export interface CarePlanEntity {
  id:              string
  internmentId:    string
  professionalId:  string
  authorizationId: string | null
  specialty:       string
  frequency:       string
  weekDays:        number[] | null
  estimatedTime:   string | null
  totalSessions:   number | null
  startDate:       Date
  endDate:         Date | null
  active:          boolean
  createdAt:       Date
}
