import type { IInsurerRateRepository } from '../../../domain/repositories/iInsurerRateRepository.js'
import type { IHealthInsurerRepository } from '../../../domain/repositories/iHealthInsurerRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { InsurerRateMapper } from '../../../interfaces/http/mappers/insurerRateMapper.js'
import type { InsurerRateResponseDto } from '../../../interfaces/http/dtos/insurerRateDto.js'

export class ListInsurerRatesUseCase {
  constructor(
    private readonly insurerRateRepository:   IInsurerRateRepository,
    private readonly healthInsurerRepository: IHealthInsurerRepository
  ) {}

  async execute(
    healthInsurerId: string,
    companyId: string,
    onlyActive?: boolean
  ): Promise<InsurerRateResponseDto[]> {
    const insurer = await this.healthInsurerRepository.findById(healthInsurerId, companyId)
    if (!insurer) throw new AppError(404, ERROR_MESSAGES.HEALTH_INSURER.NOT_FOUND)

    const rates = await this.insurerRateRepository.findAllByInsurer(healthInsurerId, onlyActive)
    return rates.map(InsurerRateMapper.toDto)
  }
}
