import type { IAlertConfigRepository } from '../../../domain/repositories/iAlertConfigRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { AlertConfigMapper } from '../../../interfaces/http/mappers/alertConfigMapper.js'
import type { CreateAlertConfigDto } from '../../../interfaces/http/schemas/alertConfigSchema.js'
import type { AlertConfigResponseDto } from '../../../interfaces/http/dtos/alertConfigDto.js'

export class CreateAlertConfigUseCase {
  constructor(private readonly alertConfigRepository: IAlertConfigRepository) {}

  async execute(dto: CreateAlertConfigDto, companyId: string): Promise<AlertConfigResponseDto> {
    // Solo puede haber una config activa por triggerType por company
    if (dto.active) {
      const existing = await this.alertConfigRepository.findActiveByTriggerType(
        dto.triggerType,
        companyId
      )
      if (existing) throw new AppError(409, ERROR_MESSAGES.ALERT_CONFIG.TRIGGER_EXISTS)
    }

    const config = await this.alertConfigRepository.create({
      companyId,
      triggerType:   dto.triggerType,
      thresholdDays: dto.thresholdDays,
      active:        dto.active,
      notifyRoles:   dto.notifyRoles,
    })

    return AlertConfigMapper.toDto(config)
  }
}
