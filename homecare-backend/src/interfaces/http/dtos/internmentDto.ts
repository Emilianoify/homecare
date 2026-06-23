export interface InternmentResponseDto {
  id:                         string
  patientId:                  string
  branchId:                   string
  healthInsurerId:            string
  responsibleDoctorId:        string
  internmentType:             string
  admissionMode:              string
  admissionDate:              string
  dischargeDate:              string | null
  dischargeReason:            string | null
  mainDiagnosis:              string
  cie10Code:                  string
  referenceHospital:          string | null
  omeRequestedBy:             string | null
  omeDate:                    string | null
  medicalFamilyAgreement:     boolean
  medicalFamilyAgreementDate: string | null
  status:                     string
  notes:                      string | null
  createdAt:                  string
}

export interface InternmentListResultDto {
  items:      InternmentResponseDto[]
  page:       number
  limit:      number
  total:      number
  totalPages: number
}
