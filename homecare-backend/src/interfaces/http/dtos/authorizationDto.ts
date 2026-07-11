export interface AuthorizationResponseDto {
  id:               string
  internmentId:     string
  healthInsurerId:  string
  number:           string
  opNumber:         string | null
  type:             string
  validFrom:        string
  validTo:          string
  authorizedModules:string[]
  status:           string
  notes:            string | null
  createdAt:        string
}
