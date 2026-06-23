export interface ProfessionalEntity {
  id:                    string
  companyId:             string
  lastName:              string
  firstName:             string
  dni:                   string
  cuit:                  string
  vatCondition:          'REGISTERED_TAXPAYER' | 'MONOTAX' | 'EXEMPT' | 'NOT_REGISTERED' | 'FINAL_CONSUMER'
  specialty:             'NURSING' | 'PHYSIOTHERAPY' | 'MEDICINE' | 'NUTRITION' | 'OCCUPATIONAL_THERAPY' | 'SPEECH_THERAPY' | 'PSYCHOLOGY' | 'SOCIAL_WORK' | 'CAREGIVER'
  secondarySpecialties:  unknown
  nationalLicense:       string | null
  provincialLicense:     string | null
  licenseProvince:       string | null
  licenseExpiresAt:      Date | null
  rnp:                   string | null
  contractType:          'EMPLOYEE' | 'MONOTAX' | 'INVOICE'
  cbu:                   string
  bankAlias:             string | null
  bank:                  string | null
  coverageZones:         unknown
  availableForEmergency: boolean
  hasOwnVehicle:         boolean
  phone:                 string
  email:                 string | null
  active:                boolean
  createdAt:             Date
  deletedAt:             Date | null
}
