import type { IPatientContactRepository } from '../../../domain/repositories/iPatientContactRepository.js'
import type { IPatientRepository } from '../../../domain/repositories/iPatientRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { PatientContactMapper } from '../../../interfaces/http/mappers/patientContactMapper.js'
import type { PatientContactResponseDto } from '../../../interfaces/http/dtos/patientContactDto.js'

export class ListPatientContactsUseCase {
  constructor(
    private readonly patientContactRepository: IPatientContactRepository,
    private readonly patientRepository: IPatientRepository
  ) {}

  async execute(patientId: string, companyId: string): Promise<PatientContactResponseDto[]> {
    const patient = await this.patientRepository.findById(patientId, companyId)
    if (!patient) throw new AppError(404, ERROR_MESSAGES.PATIENT.NOT_FOUND)

    const contacts = await this.patientContactRepository.findAllByPatient(patientId)
    return contacts.map(PatientContactMapper.toDto)
  }
}
