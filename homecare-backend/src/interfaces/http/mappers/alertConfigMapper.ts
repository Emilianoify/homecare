import type { AlertConfigEntity } from '../../../domain/entities/alertConfigEntity.js'
import type { AlertConfigResponseDto } from '../dtos/alertConfigDto.js'

export class AlertConfigMapper {
  static toDto(a: AlertConfigEntity): AlertConfigResponseDto {
    return {
      id:            a.id,
      companyId:     a.companyId,
      triggerType:   a.triggerType,
      thresholdDays: a.thresholdDays,
      active:        a.active,
      notifyRoles:   a.notifyRoles,
      createdAt:     a.createdAt.toISOString(),
    }
  }
}
