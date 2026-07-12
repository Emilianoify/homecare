import type { ISupplyOrderRepository } from '../../../domain/repositories/iSupplyOrderRepository.js'
import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import type { IBranchStockRepository } from '../../../domain/repositories/iBranchStockRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { SupplyOrderMapper } from '../../../interfaces/http/mappers/supplyOrderMapper.js'
import type { SupplyOrderResponseDto } from '../../../interfaces/http/dtos/supplyOrderDto.js'

export class SendSupplyOrderUseCase {
  constructor(
    private readonly supplyOrderRepository:  ISupplyOrderRepository,
    private readonly internmentRepository:   IInternmentRepository,
    private readonly branchStockRepository:  IBranchStockRepository
  ) {}

  async execute(
    internmentId:  string,
    supplyOrderId: string,
    companyId:     string
  ): Promise<SupplyOrderResponseDto> {
    const internment = await this.internmentRepository.findById(internmentId)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    const order = await this.supplyOrderRepository.findById(supplyOrderId, internmentId)
    if (!order) throw new AppError(404, ERROR_MESSAGES.SUPPLY_ORDER.NOT_FOUND)

    if (order.status !== 'DRAFT') {
      throw new AppError(409, ERROR_MESSAGES.SUPPLY_ORDER.NOT_EDITABLE)
    }

    // Verificar stock si la company no permite negativos
    const allowNegative = await this.branchStockRepository.getAllowNegative(companyId)

    if (!allowNegative) {
      for (const item of order.items) {
        if (!item.supplyId) continue // ítems sin supplyId son texto libre — sin control de stock

        const stock = await this.branchStockRepository.findBySupplyAndBranch(
          item.supplyId,
          internment.branchId
        )

        const currentStock = stock?.currentStock ?? 0
        if (currentStock < item.quantity) {
          throw new AppError(
            409,
            `${ERROR_MESSAGES.SUPPLY_ORDER.INSUFFICIENT_STOCK} "${item.description}" (disponible: ${currentStock}, solicitado: ${item.quantity})`
          )
        }
      }
    }

    const updated = await this.supplyOrderRepository.updateStatus(supplyOrderId, 'SENT')
    return SupplyOrderMapper.toDto(updated)
  }
}
