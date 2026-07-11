import type { IMedicationRepository } from '../../../domain/repositories/iMedicationRepository.js'
import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { MedicationMapper } from '../../../interfaces/http/mappers/medicationMapper.js'
import type { UpdateMedicationDto } from '../../../interfaces/http/schemas/medicationSchema.js'
import type { MedicationResponseDto } from '../../../interfaces/http/dtos/medicationDto.js'

export class UpdateMedicationUseCase {
  constructor(
    private readonly medicationRepository: IMedicationRepository,
    private readonly internmentRepository: IInternmentRepository
  ) {}

  async execute(
    internmentId:  string,
    medicationId:  string,
    dto:           UpdateMedicationDto
  ): Promise<MedicationResponseDto> {
    const internment = await this.internmentRepository.findById(internmentId)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    const medication = await this.medicationRepository.findById(medicationId, internmentId)
    if (!medication) throw new AppError(404, ERROR_MESSAGES.MEDICATION.NOT_FOUND)

    if (!medication.active) {
      throw new AppError(409, ERROR_MESSAGES.MEDICATION.ALREADY_DISCONTINUED)
    }

    const { endDate, ...rest } = dto
    const updated = await this.medicationRepository.update(medicationId, {
      ...rest,
      ...(endDate !== undefined && {
        endDate: endDate ? new Date(endDate) : null,
      }),
    })

    return MedicationMapper.toDto(updated)
  }
}
