import type { IInsurerSupplyRateRepository } from '../../../domain/repositories/iInsurerSupplyRateRepository.js'
import type { IHealthInsurerRepository } from '../../../domain/repositories/iHealthInsurerRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { InsurerSupplyRateMapper } from '../../../interfaces/http/mappers/insurerSupplyRateMapper.js'
import type { InsurerSupplyRateResponseDto } from '../../../interfaces/http/dtos/insurerSupplyRateDto.js'

export class ListInsurerSupplyRatesUseCase {
  constructor(
    private readonly insurerSupplyRateRepository: IInsurerSupplyRateRepository,
    private readonly healthInsurerRepository:     IHealthInsurerRepository
  ) {}

  async execute(
    healthInsurerId: string,
    companyId:       string,
    onlyActive?:     boolean
  ): Promise<InsurerSupplyRateResponseDto[]> {
    const insurer = await this.healthInsurerRepository.findById(healthInsurerId, companyId)
    if (!insurer) throw new AppError(404, ERROR_MESSAGES.HEALTH_INSURER.NOT_FOUND)

    const rates = await this.insurerSupplyRateRepository.findAllByInsurer(healthInsurerId, onlyActive)
    return rates.map(InsurerSupplyRateMapper.toDto)
  }
}
