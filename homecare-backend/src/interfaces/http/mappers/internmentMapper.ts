import type { InternmentEntity } from '../../../domain/entities/internmentEntity.js'
import type { InternmentResponseDto } from '../dtos/internmentDto.js'

export class InternmentMapper {
  static toDto(i: InternmentEntity): InternmentResponseDto {
    return {
      id:                         i.id,
      patientId:                  i.patientId,
      branchId:                   i.branchId,
      healthInsurerId:            i.healthInsurerId,
      responsibleDoctorId:        i.responsibleDoctorId,
      internmentType:             i.internmentType,
      admissionMode:              i.admissionMode,
      admissionDate:              i.admissionDate.toISOString().split('T')[0]!,
      dischargeDate:              i.dischargeDate?.toISOString().split('T')[0] ?? null,
      dischargeReason:            i.dischargeReason,
      mainDiagnosis:              i.mainDiagnosis,
      cie10Code:                  i.cie10Code,
      referenceHospital:          i.referenceHospital,
      omeRequestedBy:             i.omeRequestedBy,
      omeDate:                    i.omeDate?.toISOString().split('T')[0] ?? null,
      medicalFamilyAgreement:     i.medicalFamilyAgreement,
      medicalFamilyAgreementDate: i.medicalFamilyAgreementDate?.toISOString().split('T')[0] ?? null,
      status:                     i.status,
      notes:                      i.notes,
      createdAt:                  i.createdAt.toISOString(),
    }
  }
}
