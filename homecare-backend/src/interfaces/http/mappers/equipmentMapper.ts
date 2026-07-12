import type { EquipmentEntity } from '../../../domain/entities/equipmentEntity.js'
import type { EquipmentResponseDto } from '../dtos/equipmentDto.js'

export class EquipmentMapper {
  static toDto(e: EquipmentEntity): EquipmentResponseDto {
    return {
      id:           e.id,
      companyId:    e.companyId,
      branchId:     e.branchId,
      provider:     e.provider,
      name:         e.name,
      serialNumber: e.serialNumber,
      model:        e.model,
      dailyRate:    e.dailyRate,
      status:       e.status,
      notes:        e.notes,
      createdAt:    e.createdAt.toISOString(),
    }
  }
}
