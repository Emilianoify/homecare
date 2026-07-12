import type { IInsurerSupplyRateRepository } from '../../../domain/repositories/iInsurerSupplyRateRepository.js'
import type { IHealthInsurerRepository } from '../../../domain/repositories/iHealthInsurerRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

export class DeleteInsurerSupplyRateUseCase {
  constructor(
    private readonly insurerSupplyRateRepository: IInsurerSupplyRateRepository,
    private readonly healthInsurerRepository:     IHealthInsurerRepository
  ) {}

  async execute(healthInsurerId: string, supplyRateId: string, companyId: string): Promise<void> {
    const insurer = await this.healthInsurerRepository.findById(healthInsurerId, companyId)
    if (!insurer) throw new AppError(404, ERROR_MESSAGES.HEALTH_INSURER.NOT_FOUND)

    const rate = await this.insurerSupplyRateRepository.findById(supplyRateId, healthInsurerId)
    if (!rate) throw new AppError(404, ERROR_MESSAGES.INSURER_SUPPLY_RATE.NOT_FOUND)

    await this.insurerSupplyRateRepository.delete(supplyRateId)
  }
}
