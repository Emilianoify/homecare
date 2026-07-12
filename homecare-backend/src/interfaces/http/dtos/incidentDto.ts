export interface IncidentResponseDto {
  id:           string
  internmentId: string
  reportedById: string
  type:         string
  severity:     string
  status:       string
  description:  string
  resolution:   string | null
  occurredAt:   string
  resolvedAt:   string | null
  createdAt:    string
}

export interface IncidentListResultDto {
  items:      IncidentResponseDto[]
  page:       number
  limit:      number
  total:      number
  totalPages: number
}
