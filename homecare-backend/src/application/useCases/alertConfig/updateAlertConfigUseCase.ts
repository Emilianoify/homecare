import type { IAlertConfigRepository } from '../../../domain/repositories/iAlertConfigRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { AlertConfigMapper } from '../../../interfaces/http/mappers/alertConfigMapper.js'
import type { UpdateAlertConfigDto } from '../../../interfaces/http/schemas/alertConfigSchema.js'
import type { AlertConfigResponseDto } from '../../../interfaces/http/dtos/alertConfigDto.js'

export class UpdateAlertConfigUseCase {
  constructor(private readonly alertConfigRepository: IAlertConfigRepository) {}

  async execute(
    id:        string,
    dto:       UpdateAlertConfigDto,
    companyId: string
  ): Promise<AlertConfigResponseDto> {
    const config = await this.alertConfigRepository.findById(id, companyId)
    if (!config) throw new AppError(404, ERROR_MESSAGES.ALERT_CONFIG.NOT_FOUND)

    // Si se está activando, verificar que no exista otra activa del mismo tipo
    if (dto.active === true && !config.active) {
      const existing = await this.alertConfigRepository.findActiveByTriggerType(
        config.triggerType,
        companyId
      )
      if (existing) throw new AppError(409, ERROR_MESSAGES.ALERT_CONFIG.TRIGGER_EXISTS)
    }

    const updated = await this.alertConfigRepository.update(id, dto)
    return AlertConfigMapper.toDto(updated)
  }
}
