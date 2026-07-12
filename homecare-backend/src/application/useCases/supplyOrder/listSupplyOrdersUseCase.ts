import type { ISupplyOrderRepository } from '../../../domain/repositories/iSupplyOrderRepository.js'
import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { SupplyOrderMapper } from '../../../interfaces/http/mappers/supplyOrderMapper.js'
import type { SupplyOrderQuery } from '../../../interfaces/http/schemas/supplyOrderSchema.js'
import type { SupplyOrderListResultDto } from '../../../interfaces/http/dtos/supplyOrderDto.js'

export class ListSupplyOrdersUseCase {
  constructor(
    private readonly supplyOrderRepository: ISupplyOrderRepository,
    private readonly internmentRepository:  IInternmentRepository
  ) {}

  async execute(internmentId: string, query: SupplyOrderQuery): Promise<SupplyOrderListResultDto> {
    const internment = await this.internmentRepository.findById(internmentId)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    const { items, total } = await this.supplyOrderRepository.findAll({
      internmentId,
      page:   query.page,
      limit:  query.limit,
      status: query.status,
    })

    return {
      items:      items.map(SupplyOrderMapper.toDto),
      page:       query.page,
      limit:      query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    }
  }
}
