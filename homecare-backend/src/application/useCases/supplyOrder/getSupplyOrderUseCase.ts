import type { ISupplyOrderRepository } from '../../../domain/repositories/iSupplyOrderRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { SupplyOrderMapper } from '../../../interfaces/http/mappers/supplyOrderMapper.js'
import type { SupplyOrderResponseDto } from '../../../interfaces/http/dtos/supplyOrderDto.js'

export class GetSupplyOrderUseCase {
  constructor(private readonly supplyOrderRepository: ISupplyOrderRepository) {}

  async execute(id: string, internmentId: string): Promise<SupplyOrderResponseDto> {
    const order = await this.supplyOrderRepository.findById(id, internmentId)
    if (!order) throw new AppError(404, ERROR_MESSAGES.SUPPLY_ORDER.NOT_FOUND)
    return SupplyOrderMapper.toDto(order)
  }
}
