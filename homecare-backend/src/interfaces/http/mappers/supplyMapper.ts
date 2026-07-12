import type { SupplyEntity } from '../../../domain/entities/supplyEntity.js'
import type { SupplyResponseDto } from '../dtos/supplyDto.js'

export class SupplyMapper {
  static toDto(s: SupplyEntity): SupplyResponseDto {
    return {
      id:            s.id,
      companyId:     s.companyId,
      code:          s.code,
      name:          s.name,
      unit:          s.unit,
      purchasePrice: s.purchasePrice,
      active:        s.active,
      createdAt:     s.createdAt.toISOString(),
    }
  }
}
