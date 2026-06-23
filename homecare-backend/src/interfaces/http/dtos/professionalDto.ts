// Listado — sin CBU
export interface ProfessionalResponseDto {
  id:                    string
  lastName:              string
  firstName:             string
  fullName:              string
  dni:                   string
  cuit:                  string
  vatCondition:          string
  specialty:             string
  secondarySpecialties:  string[] | null
  nationalLicense:       string | null
  provincialLicense:     string | null
  licenseProvince:       string | null
  licenseExpiresAt:      string | null
  rnp:                   string | null
  contractType:          string
  bankAlias:             string | null
  bank:                  string | null
  coverageZones:         string[] | null
  availableForEmergency: boolean
  hasOwnVehicle:         boolean
  phone:                 string
  email:                 string | null
  active:                boolean
  createdAt:             string
}

// Detalle — incluye CBU
export interface ProfessionalDetailDto extends ProfessionalResponseDto {
  cbu: string
}

export interface ProfessionalListResultDto {
  items:      ProfessionalResponseDto[]
  page:       number
  limit:      number
  total:      number
  totalPages: number
}
