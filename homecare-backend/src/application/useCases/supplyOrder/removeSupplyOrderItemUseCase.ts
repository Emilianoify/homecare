import type { ISupplyOrderRepository } from '../../../domain/repositories/iSupplyOrderRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

export class RemoveSupplyOrderItemUseCase {
  constructor(private readonly supplyOrderRepository: ISupplyOrderRepository) {}

  async execute(
    internmentId:  string,
    supplyOrderId: string,
    itemId:        string
  ): Promise<void> {
    const order = await this.supplyOrderRepository.findById(supplyOrderId, internmentId)
    if (!order) throw new AppError(404, ERROR_MESSAGES.SUPPLY_ORDER.NOT_FOUND)

    if (order.status !== 'DRAFT') {
      throw new AppError(409, ERROR_MESSAGES.SUPPLY_ORDER.NOT_EDITABLE)
    }

    const item = await this.supplyOrderRepository.findItem(itemId, supplyOrderId)
    if (!item) throw new AppError(404, ERROR_MESSAGES.SUPPLY_ORDER_ITEM.NOT_FOUND)

    await this.supplyOrderRepository.removeItem(itemId, supplyOrderId)
  }
}
