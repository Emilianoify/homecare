export interface CarePlanResponseDto {
  id:              string
  internmentId:    string
  professionalId:  string
  authorizationId: string | null
  specialty:       string
  frequency:       string
  weekDays:        number[] | null
  estimatedTime:   string | null
  totalSessions:   number | null
  startDate:       string
  endDate:         string | null
  active:          boolean
  createdAt:       string
}
