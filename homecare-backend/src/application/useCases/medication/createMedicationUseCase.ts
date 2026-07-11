import type { IMedicationRepository } from '../../../domain/repositories/iMedicationRepository.js'
import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { MedicationMapper } from '../../../interfaces/http/mappers/medicationMapper.js'
import type { CreateMedicationDto } from '../../../interfaces/http/schemas/medicationSchema.js'
import type { MedicationResponseDto } from '../../../interfaces/http/dtos/medicationDto.js'

export class CreateMedicationUseCase {
  constructor(
    private readonly medicationRepository: IMedicationRepository,
    private readonly internmentRepository: IInternmentRepository
  ) {}

  async execute(
    internmentId:   string,
    dto:            CreateMedicationDto,
    prescribedById: string
  ): Promise<MedicationResponseDto> {
    const internment = await this.internmentRepository.findById(internmentId)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    const medication = await this.medicationRepository.create({
      internmentId,
      prescribedById,
      name:      dto.name,
      dose:      dto.dose,
      route:     dto.route,
      frequency: dto.frequency,
      startDate: new Date(dto.startDate),
      endDate:   dto.endDate ? new Date(dto.endDate) : null,
      active:    true,
    })

    return MedicationMapper.toDto(medication)
  }
}
