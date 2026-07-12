import type { ISupplyOrderRepository } from '../../../domain/repositories/iSupplyOrderRepository.js'
import type { ISupplyRepository } from '../../../domain/repositories/iSupplyRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { SupplyOrderMapper } from '../../../interfaces/http/mappers/supplyOrderMapper.js'
import type { AddSupplyOrderItemDto } from '../../../interfaces/http/schemas/supplyOrderSchema.js'
import type { SupplyOrderItemResponseDto } from '../../../interfaces/http/dtos/supplyOrderDto.js'

export class AddSupplyOrderItemUseCase {
  constructor(
    private readonly supplyOrderRepository: ISupplyOrderRepository,
    private readonly supplyRepository:      ISupplyRepository
  ) {}

  async execute(
    internmentId:  string,
    supplyOrderId: string,
    dto:           AddSupplyOrderItemDto,
    companyId:     string
  ): Promise<SupplyOrderItemResponseDto> {
    const order = await this.supplyOrderRepository.findById(supplyOrderId, internmentId)
    if (!order) throw new AppError(404, ERROR_MESSAGES.SUPPLY_ORDER.NOT_FOUND)

    if (order.status !== 'DRAFT') {
      throw new AppError(409, ERROR_MESSAGES.SUPPLY_ORDER.NOT_EDITABLE)
    }

    // Si viene supplyId, verificar que el insumo pertenece a la company
    if (dto.supplyId) {
      const supply = await this.supplyRepository.findById(dto.supplyId, companyId)
      if (!supply) throw new AppError(404, ERROR_MESSAGES.SUPPLY.NOT_FOUND)
    }

    const item = await this.supplyOrderRepository.addItem({
      supplyOrderId,
      supplyId:    dto.supplyId    ?? null,
      description: dto.description,
      quantity:    dto.quantity,
      unitPrice:   dto.unitPrice,
    })

    return SupplyOrderMapper.toItemDto(item)
  }
}
