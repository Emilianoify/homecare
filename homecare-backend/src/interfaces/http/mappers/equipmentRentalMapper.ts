import type { EquipmentRentalEntity } from '../../../domain/entities/equipmentRentalEntity.js'
import type { EquipmentRentalResponseDto } from '../dtos/equipmentRentalDto.js'

export class EquipmentRentalMapper {
  static toDto(r: EquipmentRentalEntity): EquipmentRentalResponseDto {
    return {
      id:              r.id,
      internmentId:    r.internmentId,
      equipmentId:     r.equipmentId,
      authorizationId: r.authorizationId,
      budgetId:        r.budgetId,
      monthlyRate:     r.monthlyRate,
      startDate:       r.startDate.toISOString().split('T')[0]!,
      endDate:         r.endDate?.toISOString().split('T')[0] ?? null,
      closedReason:    r.closedReason,
      billedToInsurer: r.billedToInsurer,
      createdAt:       r.createdAt.toISOString(),
    }
  }
}
