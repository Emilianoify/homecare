import type { InsurerRateEntity } from '../../../domain/entities/insurerRateEntity.js'
import type { InsurerRateResponseDto } from '../dtos/insurerRateDto.js'

export class InsurerRateMapper {
  static toDto(rate: InsurerRateEntity): InsurerRateResponseDto {
    return {
      id:              rate.id,
      healthInsurerId: rate.healthInsurerId,
      serviceItemId:   rate.serviceItemId,
      agreedPrice:     rate.agreedPrice,
      validFrom:       rate.validFrom.toISOString().split('T')[0]!,
      validTo:         rate.validTo?.toISOString().split('T')[0] ?? null,
      active:          rate.active,
      createdAt:       rate.createdAt.toISOString(),
    }
  }
}
