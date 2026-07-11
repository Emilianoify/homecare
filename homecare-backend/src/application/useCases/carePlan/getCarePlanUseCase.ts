import type { ICarePlanRepository } from '../../../domain/repositories/iCarePlanRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { CarePlanMapper } from '../../../interfaces/http/mappers/carePlanMapper.js'
import type { CarePlanResponseDto } from '../../../interfaces/http/dtos/carePlanDto.js'

export class GetCarePlanUseCase {
  constructor(private readonly carePlanRepository: ICarePlanRepository) {}

  async execute(id: string, internmentId: string): Promise<CarePlanResponseDto> {
    const carePlan = await this.carePlanRepository.findById(id, internmentId)
    if (!carePlan) throw new AppError(404, ERROR_MESSAGES.CARE_PLAN.NOT_FOUND)
    return CarePlanMapper.toDto(carePlan)
  }
}
