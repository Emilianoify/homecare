import type { IPatientContactRepository } from '../../../domain/repositories/iPatientContactRepository.js'
import type { IPatientRepository } from '../../../domain/repositories/iPatientRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { PatientContactMapper } from '../../../interfaces/http/mappers/patientContactMapper.js'
import type { CreatePatientContactDto } from '../../../interfaces/http/schemas/patientContactSchema.js'
import type { PatientContactResponseDto } from '../../../interfaces/http/dtos/patientContactDto.js'

export class CreatePatientContactUseCase {
  constructor(
    private readonly patientContactRepository: IPatientContactRepository,
    private readonly patientRepository: IPatientRepository
  ) {}

  async execute(
    patientId: string,
    dto: CreatePatientContactDto,
    companyId: string
  ): Promise<PatientContactResponseDto> {
    // Verificar que el paciente existe y pertenece a la company
    const patient = await this.patientRepository.findById(patientId, companyId)
    if (!patient) throw new AppError(404, ERROR_MESSAGES.PATIENT.NOT_FOUND)

    // Si el nuevo contacto es primario, limpiar el anterior
    if (dto.isPrimary) {
      await this.patientContactRepository.clearPrimaryByPatient(patientId)
    }

    const contact = await this.patientContactRepository.create({
      patientId,
      name:               dto.name,
      relationship:       dto.relationship,
      phone:              dto.phone,
      phoneAlternative:   dto.phoneAlternative   ?? null,
      email:              dto.email              ?? null,
      livesAtCareAddress: dto.livesAtCareAddress,
      availabilityHours:  dto.availabilityHours  ?? null,
      isPrimary:          dto.isPrimary,
    })

    return PatientContactMapper.toDto(contact)
  }
}
