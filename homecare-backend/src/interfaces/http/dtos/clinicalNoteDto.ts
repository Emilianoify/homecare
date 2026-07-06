export interface ClinicalNoteResponseDto {
  id:             string
  internmentId:   string
  visitId:        string
  professionalId: string
  specialty:      string
  datetime:       string
  content:        string
  contentHash:    string
  lockedAt:       string | null
  signed:         boolean
  createdAt:      string
}
