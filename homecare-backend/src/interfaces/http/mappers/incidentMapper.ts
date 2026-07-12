import type { IncidentEntity } from '../../../domain/entities/incidentEntity.js'
import type { IncidentResponseDto } from '../dtos/incidentDto.js'

export class IncidentMapper {
  static toDto(i: IncidentEntity): IncidentResponseDto {
    return {
      id:           i.id,
      internmentId: i.internmentId,
      reportedById: i.reportedById,
      type:         i.type,
      severity:     i.severity,
      status:       i.status,
      description:  i.description,
      resolution:   i.resolution,
      occurredAt:   i.occurredAt.toISOString(),
      resolvedAt:   i.resolvedAt?.toISOString() ?? null,
      createdAt:    i.createdAt.toISOString(),
    }
  }
}
