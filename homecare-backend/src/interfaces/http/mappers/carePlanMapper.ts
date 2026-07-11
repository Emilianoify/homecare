import type { CarePlanEntity } from '../../../domain/entities/carePlanEntity.js'
import type { CarePlanResponseDto } from '../dtos/carePlanDto.js'

export class CarePlanMapper {
  static toDto(c: CarePlanEntity): CarePlanResponseDto {
    return {
      id:              c.id,
      internmentId:    c.internmentId,
      professionalId:  c.professionalId,
      authorizationId: c.authorizationId,
      specialty:       c.specialty,
      frequency:       c.frequency,
      weekDays:        c.weekDays,
      estimatedTime:   c.estimatedTime,
      totalSessions:   c.totalSessions,
      startDate:       c.startDate.toISOString().split('T')[0]!,
      endDate:         c.endDate?.toISOString().split('T')[0] ?? null,
      active:          c.active,
      createdAt:       c.createdAt.toISOString(),
    }
  }
}
