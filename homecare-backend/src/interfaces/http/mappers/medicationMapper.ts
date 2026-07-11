import type { MedicationEntity } from '../../../domain/entities/medicationEntity.js'
import type { MedicationResponseDto } from '../dtos/medicationDto.js'

export class MedicationMapper {
  static toDto(m: MedicationEntity): MedicationResponseDto {
    return {
      id:             m.id,
      internmentId:   m.internmentId,
      prescribedById: m.prescribedById,
      name:           m.name,
      dose:           m.dose,
      route:          m.route,
      frequency:      m.frequency,
      startDate:      m.startDate.toISOString().split('T')[0]!,
      endDate:        m.endDate?.toISOString().split('T')[0] ?? null,
      active:         m.active,
      createdAt:      m.createdAt.toISOString(),
    }
  }
}
