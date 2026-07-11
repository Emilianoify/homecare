export interface DiagnosisEntity {
  id:               string
  internmentId:     string
  cie10Code:        string
  cie10Description: string
  type:             string
  status:           string
  dateFrom:         Date
  dateTo:           Date | null
  createdAt:        Date
}
