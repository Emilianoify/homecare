import type { HealthInsurerEntity } from '../../../domain/entities/healthInsurerEntity.js'
import type { HealthInsurerResponseDto } from '../dtos/healthInsurerDto.js'

export class HealthInsurerMapper {
  static toDto(h: HealthInsurerEntity): HealthInsurerResponseDto {
    return {
      id:             h.id,
      companyId:      h.companyId,
      name:           h.name,
      acronym:        h.acronym,
      cuit:           h.cuit,
      rnos:           h.rnos,
      insurerType:    h.insurerType,
      billingEmail:   h.billingEmail,
      billingMode:    h.billingMode,
      cutoffDay:      h.cutoffDay,
      paymentDays:    h.paymentDays,
      requiresPaper:  h.requiresPaper,
      operativeNotes: h.operativeNotes,
      active:         h.active,
      createdAt:      h.createdAt.toISOString(),
    }
  }
}
