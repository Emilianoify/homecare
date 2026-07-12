import type { VisitEntity } from '../../../domain/entities/visitEntity.js'
import type { VisitResponseDto } from '../dtos/visitDto.js'

export class VisitMapper {
  static toDto(v: VisitEntity): VisitResponseDto {
    return {
      id:             v.id,
      carePlanId:     v.carePlanId,
      professionalId: v.professionalId,
      internmentId:   v.internmentId,
      completedAt:    v.completedAt.toISOString(),
      status:         v.status,
      missedReason:   v.missedReason,
      lat:            v.lat,
      lng:            v.lng,
      billed:         v.billed,
      notes:          v.notes,
      createdAt:      v.createdAt.toISOString(),
    }
  }
}
