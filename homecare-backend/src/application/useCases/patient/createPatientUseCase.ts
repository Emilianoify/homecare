import type { IPatientRepository } from '../../../domain/repositories/iPatientRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { PatientMapper } from '../../../interfaces/http/mappers/patientMapper.js'
import type { CreatePatientDto } from '../../../interfaces/http/schemas/patientSchema.js'
import type { PatientResponseDto } from '../../../interfaces/http/dtos/patientDto.js'

export class CreatePatientUseCase {
  constructor(private readonly patientRepository: IPatientRepository) {}

  async execute(dto: CreatePatientDto, companyId: string): Promise<PatientResponseDto> {
    const existing = await this.patientRepository.findByDni(dto.dni, companyId)
    if (existing) throw new AppError(409, ERROR_MESSAGES.PATIENT.DNI_EXISTS)

    const patient = await this.patientRepository.create({
      ...dto,
      companyId,
      dateOfBirth:            new Date(dto.dateOfBirth),
      affiliateNumber:        dto.affiliateNumber        ?? null,
      selfPerceivedGender:    dto.selfPerceivedGender    ?? null,
      cuit:                   dto.cuit                   ?? null,
      carePostalCode:         dto.carePostalCode         ?? null,
      accessNotes:            dto.accessNotes            ?? null,
      email:                  dto.email                  ?? null,
      bloodType:              dto.bloodType              ?? null,
      rhFactor:               dto.rhFactor               ?? null,
      allergies:              dto.allergies              ?? null,
      referringDoctorName:    dto.referringDoctorName    ?? null,
      referringDoctorLicense: dto.referringDoctorLicense ?? null,
      referringDoctorPhone:   dto.referringDoctorPhone   ?? null,
      notes:                  dto.notes                  ?? null,
    })

    return PatientMapper.toDto(patient)
  }
}
