import type { Request, Response } from 'express'
import { BranchStockRepository } from '../../../infrastructure/database/repositories/branchStockRepository.js'
import { BranchRepository } from '../../../infrastructure/database/repositories/branchRepository.js'
import { SupplyRepository } from '../../../infrastructure/database/repositories/supplyRepository.js'
import { ListBranchStockUseCase } from '../../../application/useCases/branchStock/listBranchStockUseCase.js'
import { CreateStockMovementUseCase } from '../../../application/useCases/branchStock/createStockMovementUseCase.js'
import { ListStockMovementsUseCase } from '../../../application/useCases/branchStock/listStockMovementsUseCase.js'
import { sendOk, sendCreated, sendPaginated } from '../../../shared/helpers/responseHelper.js'
import { SUCCESS_MESSAGES } from '../../../shared/constants/messages.js'
import type {
  CreateStockMovementDto,
  BranchStockQuery,
  StockMovementQuery,
} from '../schemas/branchStockSchema.js'

export class BranchStockController {
  private readonly stockRepo  = new BranchStockRepository()
  private readonly branchRepo = new BranchRepository()
  private readonly supplyRepo = new SupplyRepository()

  listStock = async (req: Request, res: Response): Promise<void> => {
    const query  = req.query as unknown as BranchStockQuery
    const result = await new ListBranchStockUseCase(this.stockRepo)
      .execute(req.user!.companyId, query.branchId)
    sendOk(res, SUCCESS_MESSAGES.BRANCH_STOCK.LIST, result)
  }

  createMovement = async (req: Request, res: Response): Promise<void> => {
    const result = await new CreateStockMovementUseCase(
      this.stockRepo,
      this.branchRepo,
      this.supplyRepo
    ).execute(
      req.body as CreateStockMovementDto,
      req.user!.companyId,
      req.user!.userId
    )
    sendCreated(res, SUCCESS_MESSAGES.STOCK_MOVEMENT.CREATED, result)
  }

  listMovements = async (req: Request, res: Response): Promise<void> => {
    const query  = req.query as unknown as StockMovementQuery
    const result = await new ListStockMovementsUseCase(this.stockRepo)
      .execute(req.user!.companyId, query)
    sendPaginated(res, SUCCESS_MESSAGES.STOCK_MOVEMENT.LIST, result.items, {
      page:       result.page,
      limit:      result.limit,
      total:      result.total,
      totalPages: result.totalPages,
    })
  }
}
