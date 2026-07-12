import type { InsurerSupplyRateEntity } from '../../../domain/entities/insurerSupplyRateEntity.js'
import type { InsurerSupplyRateResponseDto } from '../dtos/insurerSupplyRateDto.js'

export class InsurerSupplyRateMapper {
  static toDto(r: InsurerSupplyRateEntity): InsurerSupplyRateResponseDto {
    return {
      id:              r.id,
      healthInsurerId: r.healthInsurerId,
      supplyId:        r.supplyId,
      agreedPrice:     r.agreedPrice,
      validFrom:       r.validFrom.toISOString().split('T')[0]!,
      validTo:         r.validTo?.toISOString().split('T')[0] ?? null,
      active:          r.active,
      createdAt:       r.createdAt.toISOString(),
    }
  }
}
