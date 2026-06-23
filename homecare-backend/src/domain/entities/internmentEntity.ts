export interface InternmentEntity {
  id:                         string
  patientId:                  string
  branchId:                   string
  healthInsurerId:            string
  responsibleDoctorId:        string
  internmentType:             'ACUTE' | 'SUBACUTE' | 'CHRONIC' | 'COMPLEX_CHRONIC' | 'PALLIATIVE_CARE'
  admissionMode:              'HOSPITAL_DISCHARGE' | 'FROM_HOME'
  admissionDate:              Date
  dischargeDate:              Date | null
  dischargeReason:            string | null
  mainDiagnosis:              string
  cie10Code:                  string
  referenceHospital:          string | null
  omeRequestedBy:             string | null
  omeDate:                    Date | null
  medicalFamilyAgreement:     boolean
  medicalFamilyAgreementDate: Date | null
  status:                     'ACTIVE' | 'SUSPENDED' | 'DISCHARGED' | 'CANCELLED'
  notes:                      string | null
  createdAt:                  Date
  deletedAt:                  Date | null
}
