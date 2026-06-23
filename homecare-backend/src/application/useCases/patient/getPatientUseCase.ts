import type { IPatientRepository } from '../../../domain/repositories/iPatientRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { PatientMapper } from '../../../interfaces/http/mappers/patientMapper.js'
import type { PatientResponseDto } from '../../../interfaces/http/dtos/patientDto.js'

export class GetPatientUseCase {
  constructor(private readonly patientRepository: IPatientRepository) {}

  async execute(id: string, companyId: string): Promise<PatientResponseDto> {
    const patient = await this.patientRepository.findById(id, companyId)
    if (!patient) throw new AppError(404, ERROR_MESSAGES.PATIENT.NOT_FOUND)
    return PatientMapper.toDto(patient)
  }
}
