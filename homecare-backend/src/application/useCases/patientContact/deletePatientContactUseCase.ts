import type { IPatientContactRepository } from '../../../domain/repositories/iPatientContactRepository.js'
import type { IPatientRepository } from '../../../domain/repositories/iPatientRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

export class DeletePatientContactUseCase {
  constructor(
    private readonly patientContactRepository: IPatientContactRepository,
    private readonly patientRepository: IPatientRepository
  ) {}

  async execute(patientId: string, contactId: string, companyId: string): Promise<void> {
    const patient = await this.patientRepository.findById(patientId, companyId)
    if (!patient) throw new AppError(404, ERROR_MESSAGES.PATIENT.NOT_FOUND)

    const contact = await this.patientContactRepository.findById(contactId, patientId)
    if (!contact) throw new AppError(404, ERROR_MESSAGES.PATIENT_CONTACT.NOT_FOUND)

    await this.patientContactRepository.delete(contactId)
  }
}
