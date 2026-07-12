import type { IBranchStockRepository } from '../../../domain/repositories/iBranchStockRepository.js'
import type { IBranchRepository } from '../../../domain/repositories/iBranchRepository.js'
import type { ISupplyRepository } from '../../../domain/repositories/iSupplyRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { BranchStockMapper } from '../../../interfaces/http/mappers/branchStockMapper.js'
import type { CreateStockMovementDto } from '../../../interfaces/http/schemas/branchStockSchema.js'
import type { StockMovementResponseDto } from '../../../interfaces/http/dtos/branchStockDto.js'

export class CreateStockMovementUseCase {
  constructor(
    private readonly branchStockRepository: IBranchStockRepository,
    private readonly branchRepository:      IBranchRepository,
    private readonly supplyRepository:      ISupplyRepository
  ) {}

  async execute(
    dto:         CreateStockMovementDto,
    companyId:   string,
    createdById: string
  ): Promise<StockMovementResponseDto> {
    // Ownership — sucursal pertenece a la company
    const branch = await this.branchRepository.findById(dto.branchId, companyId)
    if (!branch) throw new AppError(404, ERROR_MESSAGES.BRANCH.NOT_FOUND)

    // Ownership — insumo pertenece a la company
    const supply = await this.supplyRepository.findById(dto.supplyId, companyId)
    if (!supply) throw new AppError(404, ERROR_MESSAGES.SUPPLY.NOT_FOUND)

    // Obtener o crear registro de stock
    const stock = await this.branchStockRepository.findOrCreate(
      dto.supplyId,
      dto.branchId,
      companyId
    )

    const previousStock = stock.currentStock
    const newStock      = previousStock + dto.quantity

    // Si no permite negativo, validar
    const allowNegative = await this.branchStockRepository.getAllowNegative(companyId)
    if (!allowNegative && newStock < 0) {
      throw new AppError(409, ERROR_MESSAGES.BRANCH_STOCK.INSUFFICIENT)
    }

    // Registrar movimiento y actualizar stock en transacción
    const movement = await this.branchStockRepository.createMovement({
      companyId,
      branchId:     dto.branchId,
      supplyId:     dto.supplyId,
      type:         dto.type,
      quantity:     dto.quantity,
      previousStock,
      newStock,
      reference:    dto.reference ?? null,
      notes:        dto.notes     ?? null,
      createdById,
    })

    await this.branchStockRepository.updateStock(dto.supplyId, dto.branchId, newStock)

    return BranchStockMapper.toMovementDto(movement)
  }
}
