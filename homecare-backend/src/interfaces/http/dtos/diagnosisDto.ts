export interface DiagnosisResponseDto {
  id:               string
  internmentId:     string
  cie10Code:        string
  cie10Description: string
  type:             string
  status:           string
  dateFrom:         string
  dateTo:           string | null
  createdAt:        string
}
