import type { IInsurerRateRepository } from '../../../domain/repositories/iInsurerRateRepository.js'
import type { IHealthInsurerRepository } from '../../../domain/repositories/iHealthInsurerRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

export class DeleteInsurerRateUseCase {
  constructor(
    private readonly insurerRateRepository:   IInsurerRateRepository,
    private readonly healthInsurerRepository: IHealthInsurerRepository
  ) {}

  async execute(healthInsurerId: string, rateId: string, companyId: string): Promise<void> {
    const insurer = await this.healthInsurerRepository.findById(healthInsurerId, companyId)
    if (!insurer) throw new AppError(404, ERROR_MESSAGES.HEALTH_INSURER.NOT_FOUND)

    const rate = await this.insurerRateRepository.findById(rateId, healthInsurerId)
    if (!rate) throw new AppError(404, ERROR_MESSAGES.INSURER_RATE.NOT_FOUND)

    await this.insurerRateRepository.delete(rateId)
  }
}
