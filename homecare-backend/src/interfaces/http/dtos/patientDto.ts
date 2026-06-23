export interface PatientResponseDto {
  id:                     string
  branchId:               string
  lastName:               string
  firstName:              string
  fullName:               string
  dni:                    string
  affiliateNumber:        string | null
  dateOfBirth:            string
  biologicalSex:          string
  selfPerceivedGender:    string | null
  vatCondition:           string
  cuit:                   string | null
  careAddress:            string
  careCity:               string
  careProvince:           string
  carePostalCode:         string | null
  accessNotes:            string | null
  phone:                  string
  email:                  string | null
  bloodType:              string | null
  rhFactor:               string | null
  allergies:              string | null
  referringDoctorName:    string | null
  referringDoctorLicense: string | null
  referringDoctorPhone:   string | null
  notes:                  string | null
  createdAt:              string
}

export interface PatientListResultDto {
  items:      PatientResponseDto[]
  page:       number
  limit:      number
  total:      number
  totalPages: number
}
