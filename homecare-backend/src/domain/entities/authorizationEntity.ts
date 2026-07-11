export interface AuthorizationEntity {
  id:               string
  internmentId:     string
  healthInsurerId:  string
  number:           string
  opNumber:         string | null
  type:             string
  validFrom:        Date
  validTo:          Date
  authorizedModules:string[]
  status:           string
  notes:            string | null
  createdAt:        Date
}
