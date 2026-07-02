import type { IHealthInsurerRepository } from '../../../domain/repositories/iHealthInsurerRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

export class DeleteHealthInsurerUseCase {
  constructor(private readonly healthInsurerRepository: IHealthInsurerRepository) {}

  async execute(id: string, companyId: string): Promise<void> {
    const healthInsurer = await this.healthInsurerRepository.findById(id, companyId)
    if (!healthInsurer) throw new AppError(404, ERROR_MESSAGES.HEALTH_INSURER.NOT_FOUND)
    await this.healthInsurerRepository.softDelete(id)
  }
}
