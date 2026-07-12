import type { ISupplyOrderRepository } from '../../../domain/repositories/iSupplyOrderRepository.js'
import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { SupplyOrderMapper } from '../../../interfaces/http/mappers/supplyOrderMapper.js'
import type { CancelSupplyOrderDto } from '../../../interfaces/http/schemas/supplyOrderSchema.js'
import type { SupplyOrderResponseDto } from '../../../interfaces/http/dtos/supplyOrderDto.js'

const FINAL_STATUSES = ['DELIVERED', 'CANCELLED']

export class CancelSupplyOrderUseCase {
  constructor(
    private readonly supplyOrderRepository: ISupplyOrderRepository,
    private readonly internmentRepository:  IInternmentRepository
  ) {}

  async execute(
    internmentId:  string,
    supplyOrderId: string,
    dto:           CancelSupplyOrderDto
  ): Promise<SupplyOrderResponseDto> {
    const internment = await this.internmentRepository.findById(internmentId)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    const order = await this.supplyOrderRepository.findById(supplyOrderId, internmentId)
    if (!order) throw new AppError(404, ERROR_MESSAGES.SUPPLY_ORDER.NOT_FOUND)

    if (FINAL_STATUSES.includes(order.status)) {
      throw new AppError(409, ERROR_MESSAGES.SUPPLY_ORDER.NOT_CANCELLABLE)
    }

    const updated = await this.supplyOrderRepository.updateStatus(
      supplyOrderId,
      'CANCELLED',
      dto.cancellationReason
    )

    return SupplyOrderMapper.toDto(updated)
  }
}
