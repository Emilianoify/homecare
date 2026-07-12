import type { SupplyOrderEntity, SupplyOrderItemEntity } from '../../../domain/entities/supplyOrderEntity.js'
import type { SupplyOrderResponseDto, SupplyOrderItemResponseDto } from '../dtos/supplyOrderDto.js'

export class SupplyOrderMapper {
  static toItemDto(item: SupplyOrderItemEntity): SupplyOrderItemResponseDto {
    return {
      id:            item.id,
      supplyOrderId: item.supplyOrderId,
      supplyId:      item.supplyId,
      description:   item.description,
      quantity:      item.quantity,
      unitPrice:     item.unitPrice,
      subtotal:      item.quantity * item.unitPrice,
      createdAt:     item.createdAt.toISOString(),
    }
  }

  static toDto(order: SupplyOrderEntity): SupplyOrderResponseDto {
    const items = order.items.map(SupplyOrderMapper.toItemDto)
    const total = items.reduce((sum, i) => sum + i.subtotal, 0)

    return {
      id:                 order.id,
      internmentId:       order.internmentId,
      companyId:          order.companyId,
      createdById:        order.createdById,
      budgetId:           order.budgetId,
      status:             order.status,
      notes:              order.notes,
      cancellationReason: order.cancellationReason,
      total,
      items,
      createdAt:          order.createdAt.toISOString(),
    }
  }
}
