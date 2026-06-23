import type { PatientEntity } from '../../../domain/entities/patientEntity.js'
import type { PatientResponseDto } from '../dtos/patientDto.js'

export class PatientMapper {
  static toDto(patient: PatientEntity): PatientResponseDto {
    return {
      id:                     patient.id,
      branchId:               patient.branchId,
      lastName:               patient.lastName,
      firstName:              patient.firstName,
      fullName:               `${patient.lastName}, ${patient.firstName}`,
      dni:                    patient.dni,
      affiliateNumber:        patient.affiliateNumber,
      dateOfBirth:            patient.dateOfBirth.toISOString().split('T')[0]!,
      biologicalSex:          patient.biologicalSex,
      selfPerceivedGender:    patient.selfPerceivedGender,
      vatCondition:           patient.vatCondition,
      cuit:                   patient.cuit,
      careAddress:            patient.careAddress,
      careCity:               patient.careCity,
      careProvince:           patient.careProvince,
      carePostalCode:         patient.carePostalCode,
      accessNotes:            patient.accessNotes,
      phone:                  patient.phone,
      email:                  patient.email,
      bloodType:              patient.bloodType,
      rhFactor:               patient.rhFactor,
      allergies:              patient.allergies,
      referringDoctorName:    patient.referringDoctorName,
      referringDoctorLicense: patient.referringDoctorLicense,
      referringDoctorPhone:   patient.referringDoctorPhone,
      notes:                  patient.notes,
      createdAt:              patient.createdAt.toISOString(),
    }
  }
}
