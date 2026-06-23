import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { InternmentMapper } from '../../../interfaces/http/mappers/internmentMapper.js'
import type { CreateInternmentDto } from '../../../interfaces/http/schemas/internmentSchema.js'
import type { InternmentResponseDto } from '../../../interfaces/http/dtos/internmentDto.js'

export class CreateInternmentUseCase {
  constructor(private readonly internmentRepository: IInternmentRepository) {}

  async execute(dto: CreateInternmentDto): Promise<InternmentResponseDto> {
    const active = await this.internmentRepository.findActiveByPatient(dto.patientId)
    if (active) throw new AppError(409, ERROR_MESSAGES.INTERNMENT.ALREADY_ACTIVE)

    const internment = await this.internmentRepository.create({
      ...dto,
      admissionDate:              new Date(dto.admissionDate),
      omeDate:                    dto.omeDate ? new Date(dto.omeDate) : null,
      medicalFamilyAgreementDate: dto.medicalFamilyAgreementDate
        ? new Date(dto.medicalFamilyAgreementDate)
        : null,
      referenceHospital: dto.referenceHospital ?? null,
      omeRequestedBy:    dto.omeRequestedBy    ?? null,
      notes:             dto.notes             ?? null,
      dischargeDate:     null,
      dischargeReason:   null,
      status:            'ACTIVE',
    })

    return InternmentMapper.toDto(internment)
  }
}
