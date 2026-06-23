export interface PatientEntity {
  id:                     string
  companyId:              string
  branchId:               string
  lastName:               string
  firstName:              string
  dni:                    string
  affiliateNumber:        string | null
  dateOfBirth:            Date
  biologicalSex:          'MALE' | 'FEMALE' | 'INTERSEX'
  selfPerceivedGender:    string | null
  vatCondition:           'REGISTERED_TAXPAYER' | 'MONOTAX' | 'EXEMPT' | 'NOT_REGISTERED' | 'FINAL_CONSUMER'
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
  createdAt:              Date
  deletedAt:              Date | null
}
