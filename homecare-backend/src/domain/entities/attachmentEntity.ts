export interface AttachmentEntity {
  id:             string
  internmentId:   string
  clinicalNoteId: string | null
  uploadedById:   string
  type:           string
  fileName:       string
  storageUrl:     string
  mimeType:       string
  sizeBytes:      number
  createdAt:      Date
}
