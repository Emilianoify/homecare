import type { DiagnosisEntity } from '../../../domain/entities/diagnosisEntity.js'
import type { DiagnosisResponseDto } from '../dtos/diagnosisDto.js'

export class DiagnosisMapper {
  static toDto(d: DiagnosisEntity): DiagnosisResponseDto {
    return {
      id:               d.id,
      internmentId:     d.internmentId,
      cie10Code:        d.cie10Code,
      cie10Description: d.cie10Description,
      type:             d.type,
      status:           d.status,
      dateFrom:         d.dateFrom.toISOString().split('T')[0]!,
      dateTo:           d.dateTo?.toISOString().split('T')[0] ?? null,
      createdAt:        d.createdAt.toISOString(),
    }
  }
}
