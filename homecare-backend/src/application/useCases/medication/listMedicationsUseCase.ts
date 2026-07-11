import type { IMedicationRepository } from '../../../domain/repositories/iMedicationRepository.js'
import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { MedicationMapper } from '../../../interfaces/http/mappers/medicationMapper.js'
import type { MedicationResponseDto } from '../../../interfaces/http/dtos/medicationDto.js'

export class ListMedicationsUseCase {
  constructor(
    private readonly medicationRepository: IMedicationRepository,
    private readonly internmentRepository: IInternmentRepository
  ) {}

  async execute(
    internmentId: string,
    active?:      boolean
  ): Promise<MedicationResponseDto[]> {
    const internment = await this.internmentRepository.findById(internmentId)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    const medications = await this.medicationRepository.findAll({ internmentId, active })
    return medications.map(MedicationMapper.toDto)
  }
}
