import type { IFunctionalStatusRepository } from '../../../domain/repositories/iFunctionalStatusRepository.js'
import type { IPatientRepository } from '../../../domain/repositories/iPatientRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { FunctionalStatusMapper } from '../../../interfaces/http/mappers/functionalStatusMapper.js'
import type { FunctionalStatusResponseDto } from '../../../interfaces/http/dtos/functionalStatusDto.js'

export class GetLatestFunctionalStatusUseCase {
  constructor(
    private readonly functionalStatusRepository: IFunctionalStatusRepository,
    private readonly patientRepository: IPatientRepository
  ) {}

  async execute(patientId: string, companyId: string): Promise<FunctionalStatusResponseDto | null> {
    const patient = await this.patientRepository.findById(patientId, companyId)
    if (!patient) throw new AppError(404, ERROR_MESSAGES.PATIENT.NOT_FOUND)

    const record = await this.functionalStatusRepository.findLatestByPatient(patientId)
    return record ? FunctionalStatusMapper.toDto(record) : null
  }
}
