import type { ICarePlanRepository } from '../../../domain/repositories/iCarePlanRepository.js'
import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { CarePlanMapper } from '../../../interfaces/http/mappers/carePlanMapper.js'
import type { CarePlanResponseDto } from '../../../interfaces/http/dtos/carePlanDto.js'

export class ListCarePlansUseCase {
  constructor(
    private readonly carePlanRepository:   ICarePlanRepository,
    private readonly internmentRepository: IInternmentRepository
  ) {}

  async execute(internmentId: string, active?: boolean): Promise<CarePlanResponseDto[]> {
    const internment = await this.internmentRepository.findById(internmentId)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    const plans = await this.carePlanRepository.findAll({ internmentId, active })
    return plans.map(CarePlanMapper.toDto)
  }
}
