import type { IFunctionalStatusRepository } from '../../../domain/repositories/iFunctionalStatusRepository.js'
import type { IPatientRepository } from '../../../domain/repositories/iPatientRepository.js'
import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { FunctionalStatusMapper } from '../../../interfaces/http/mappers/functionalStatusMapper.js'
import type { CreateFunctionalStatusDto } from '../../../interfaces/http/schemas/functionalStatusSchema.js'
import type { FunctionalStatusResponseDto } from '../../../interfaces/http/dtos/functionalStatusDto.js'

export class CreateFunctionalStatusUseCase {
  constructor(
    private readonly functionalStatusRepository: IFunctionalStatusRepository,
    private readonly patientRepository: IPatientRepository,
    private readonly internmentRepository: IInternmentRepository
  ) {}

  async execute(
    patientId:    string,
    dto:          CreateFunctionalStatusDto,
    companyId:    string,
    recordedById: string
  ): Promise<FunctionalStatusResponseDto> {
    // Verificar que el paciente existe y pertenece a la company
    const patient = await this.patientRepository.findById(patientId, companyId)
    if (!patient) throw new AppError(404, ERROR_MESSAGES.PATIENT.NOT_FOUND)

    // Verificar que la internación existe y pertenece al paciente
    const internment = await this.internmentRepository.findById(dto.internmentId)
    if (!internment || internment.patientId !== patientId) {
      throw new AppError(404, ERROR_MESSAGES.FUNCTIONAL_STATUS.INTERNMENT_NOT_FOUND)
    }

    const record = await this.functionalStatusRepository.create({
      patientId,
      internmentId:           dto.internmentId,
      recordedById,
      date:                   new Date(dto.date),
      bedridden:              dto.bedridden,
      wheelchair:             dto.wheelchair,
      oxygenDependent:        dto.oxygenDependent,
      oxygenLitersPerMin:     dto.oxygenLitersPerMin     ?? null,
      tracheostomy:           dto.tracheostomy,
      pumpFeeding:            dto.pumpFeeding,
      nasogastricTube:        dto.nasogastricTube,
      urinaryCatheter:        dto.urinaryCatheter,
      pressureUlcers:         dto.pressureUlcers,
      pressureUlcersLocation: dto.pressureUlcersLocation ?? null,
      barthelScore:           dto.barthelScore           ?? null,
      notes:                  dto.notes                  ?? null,
    })

    return FunctionalStatusMapper.toDto(record)
  }
}
