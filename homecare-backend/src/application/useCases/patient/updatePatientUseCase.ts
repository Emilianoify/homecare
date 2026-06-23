import type { IPatientRepository } from '../../../domain/repositories/iPatientRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { PatientMapper } from '../../../interfaces/http/mappers/patientMapper.js'
import type { UpdatePatientDto } from '../../../interfaces/http/schemas/patientSchema.js'
import type { PatientResponseDto } from '../../../interfaces/http/dtos/patientDto.js'

export class UpdatePatientUseCase {
  constructor(private readonly patientRepository: IPatientRepository) {}

  async execute(id: string, dto: UpdatePatientDto, companyId: string): Promise<PatientResponseDto> {
    const patient = await this.patientRepository.findById(id, companyId)
    if (!patient) throw new AppError(404, ERROR_MESSAGES.PATIENT.NOT_FOUND)

    if (dto.dni && dto.dni !== patient.dni) {
      const existing = await this.patientRepository.findByDni(dto.dni, companyId)
      if (existing) throw new AppError(409, ERROR_MESSAGES.PATIENT.DNI_EXISTS)
    }

    const { dateOfBirth, ...rest } = dto
    const updated = await this.patientRepository.update(id, {
      ...rest,
      ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
    })

    return PatientMapper.toDto(updated)
  }
}
