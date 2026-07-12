import type { ISupplyOrderRepository } from '../../../domain/repositories/iSupplyOrderRepository.js'
import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { SupplyOrderMapper } from '../../../interfaces/http/mappers/supplyOrderMapper.js'
import type { CreateSupplyOrderDto } from '../../../interfaces/http/schemas/supplyOrderSchema.js'
import type { SupplyOrderResponseDto } from '../../../interfaces/http/dtos/supplyOrderDto.js'

export class CreateSupplyOrderUseCase {
  constructor(
    private readonly supplyOrderRepository: ISupplyOrderRepository,
    private readonly internmentRepository:  IInternmentRepository
  ) {}

  async execute(
    internmentId: string,
    dto:          CreateSupplyOrderDto,
    companyId:    string,
    createdById:  string
  ): Promise<SupplyOrderResponseDto> {
    const internment = await this.internmentRepository.findById(internmentId)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    const order = await this.supplyOrderRepository.create({
      internmentId,
      companyId,
      createdById,
      budgetId: dto.budgetId ?? null,
      notes:    dto.notes    ?? null,
    })

    return SupplyOrderMapper.toDto(order)
  }
}
