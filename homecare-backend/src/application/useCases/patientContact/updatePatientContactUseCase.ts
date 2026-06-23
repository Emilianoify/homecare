import type { IPatientContactRepository } from '../../../domain/repositories/iPatientContactRepository.js'
import type { IPatientRepository } from '../../../domain/repositories/iPatientRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { PatientContactMapper } from '../../../interfaces/http/mappers/patientContactMapper.js'
import type { UpdatePatientContactDto } from '../../../interfaces/http/schemas/patientContactSchema.js'
import type { PatientContactResponseDto } from '../../../interfaces/http/dtos/patientContactDto.js'

export class UpdatePatientContactUseCase {
  constructor(
    private readonly patientContactRepository: IPatientContactRepository,
    private readonly patientRepository: IPatientRepository
  ) {}

  async execute(
    patientId: string,
    contactId: string,
    dto: UpdatePatientContactDto,
    companyId: string
  ): Promise<PatientContactResponseDto> {
    const patient = await this.patientRepository.findById(patientId, companyId)
    if (!patient) throw new AppError(404, ERROR_MESSAGES.PATIENT.NOT_FOUND)

    const contact = await this.patientContactRepository.findById(contactId, patientId)
    if (!contact) throw new AppError(404, ERROR_MESSAGES.PATIENT_CONTACT.NOT_FOUND)

    // Si se está marcando como primario, limpiar el anterior
    if (dto.isPrimary === true) {
      await this.patientContactRepository.clearPrimaryByPatient(patientId)
    }

    const updated = await this.patientContactRepository.update(contactId, dto)
    return PatientContactMapper.toDto(updated)
  }
}
