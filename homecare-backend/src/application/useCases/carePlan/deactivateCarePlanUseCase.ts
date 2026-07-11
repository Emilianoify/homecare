import type { ICarePlanRepository } from '../../../domain/repositories/iCarePlanRepository.js'
import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { CarePlanMapper } from '../../../interfaces/http/mappers/carePlanMapper.js'
import type { CarePlanResponseDto } from '../../../interfaces/http/dtos/carePlanDto.js'

export class DeactivateCarePlanUseCase {
  constructor(
    private readonly carePlanRepository:   ICarePlanRepository,
    private readonly internmentRepository: IInternmentRepository
  ) {}

  async execute(internmentId: string, carePlanId: string): Promise<CarePlanResponseDto> {
    const internment = await this.internmentRepository.findById(internmentId)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    const carePlan = await this.carePlanRepository.findById(carePlanId, internmentId)
    if (!carePlan) throw new AppError(404, ERROR_MESSAGES.CARE_PLAN.NOT_FOUND)

    if (!carePlan.active) {
      throw new AppError(409, ERROR_MESSAGES.CARE_PLAN.ALREADY_INACTIVE)
    }

    const updated = await this.carePlanRepository.deactivate(carePlanId)
    return CarePlanMapper.toDto(updated)
  }
}
