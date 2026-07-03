export interface ClinicalNoteEntity {
  id:             string
  internmentId:   string
  visitId:        string
  professionalId: string
  specialty:      'NURSING' | 'PHYSIOTHERAPY' | 'MEDICINE' | 'NUTRITION' | 'OCCUPATIONAL_THERAPY' | 'SPEECH_THERAPY' | 'PSYCHOLOGY' | 'SOCIAL_WORK' | 'CAREGIVER'
  datetime:       Date
  content:        string
  contentHash:    string
  lockedAt:       Date | null
  signed:         boolean
  createdAt:      Date
}
