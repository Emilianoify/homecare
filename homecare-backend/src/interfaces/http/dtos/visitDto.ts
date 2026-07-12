export interface VisitResponseDto {
  id:             string
  carePlanId:     string
  professionalId: string
  internmentId:   string
  completedAt:    string
  status:         string
  missedReason:   string | null
  lat:            number | null
  lng:            number | null
  billed:         boolean
  notes:          string | null
  createdAt:      string
}

export interface VisitListResultDto {
  items:      VisitResponseDto[]
  page:       number
  limit:      number
  total:      number
  totalPages: number
}
