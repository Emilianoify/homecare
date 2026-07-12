import type { IAlertConfigRepository } from '../../../domain/repositories/iAlertConfigRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { AlertConfigMapper } from '../../../interfaces/http/mappers/alertConfigMapper.js'
import type { AlertConfigResponseDto } from '../../../interfaces/http/dtos/alertConfigDto.js'

export class GetAlertConfigUseCase {
  constructor(private readonly alertConfigRepository: IAlertConfigRepository) {}

  async execute(id: string, companyId: string): Promise<AlertConfigResponseDto> {
    const config = await this.alertConfigRepository.findById(id, companyId)
    if (!config) throw new AppError(404, ERROR_MESSAGES.ALERT_CONFIG.NOT_FOUND)
    return AlertConfigMapper.toDto(config)
  }
}
