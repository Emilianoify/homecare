export interface IncidentEntity {
  id:            string
  internmentId:  string
  reportedById:  string
  type:          string
  severity:      string
  status:        string
  description:   string
  resolution:    string | null
  occurredAt:    Date
  resolvedAt:    Date | null
  createdAt:     Date
}
