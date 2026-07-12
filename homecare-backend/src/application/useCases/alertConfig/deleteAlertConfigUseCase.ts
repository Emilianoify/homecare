import type { IAlertConfigRepository } from '../../../domain/repositories/iAlertConfigRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

export class DeleteAlertConfigUseCase {
  constructor(private readonly alertConfigRepository: IAlertConfigRepository) {}

  async execute(id: string, companyId: string): Promise<void> {
    const config = await this.alertConfigRepository.findById(id, companyId)
    if (!config) throw new AppError(404, ERROR_MESSAGES.ALERT_CONFIG.NOT_FOUND)
    await this.alertConfigRepository.softDelete(id)
  }
}
