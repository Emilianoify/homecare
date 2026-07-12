import type { Request, Response } from 'express'
import { SupplyOrderRepository } from '../../../infrastructure/database/repositories/supplyOrderRepository.js'
import { InternmentRepository } from '../../../infrastructure/database/repositories/internmentRepository.js'
import { SupplyRepository } from '../../../infrastructure/database/repositories/supplyRepository.js'
import { BranchStockRepository } from '../../../infrastructure/database/repositories/branchStockRepository.js'
import { CreateSupplyOrderUseCase } from '../../../application/useCases/supplyOrder/createSupplyOrderUseCase.js'
import { ListSupplyOrdersUseCase } from '../../../application/useCases/supplyOrder/listSupplyOrdersUseCase.js'
import { GetSupplyOrderUseCase } from '../../../application/useCases/supplyOrder/getSupplyOrderUseCase.js'
import { SendSupplyOrderUseCase } from '../../../application/useCases/supplyOrder/sendSupplyOrderUseCase.js'
import { CancelSupplyOrderUseCase } from '../../../application/useCases/supplyOrder/cancelSupplyOrderUseCase.js'
import { AddSupplyOrderItemUseCase } from '../../../application/useCases/supplyOrder/addSupplyOrderItemUseCase.js'
import { RemoveSupplyOrderItemUseCase } from '../../../application/useCases/supplyOrder/removeSupplyOrderItemUseCase.js'
import { sendOk, sendCreated, sendNoContent, sendPaginated } from '../../../shared/helpers/responseHelper.js'
import { SUCCESS_MESSAGES } from '../../../shared/constants/messages.js'
import type {
  CreateSupplyOrderDto,
  AddSupplyOrderItemDto,
  CancelSupplyOrderDto,
  SupplyOrderQuery,
} from '../schemas/supplyOrderSchema.js'

export class SupplyOrderController {
  private readonly orderRepo       = new SupplyOrderRepository()
  private readonly internmentRepo  = new InternmentRepository()
  private readonly supplyRepo      = new SupplyRepository()
  private readonly stockRepo       = new BranchStockRepository()

  list = async (req: Request, res: Response): Promise<void> => {
    const query  = req.query as unknown as SupplyOrderQuery
    const result = await new ListSupplyOrdersUseCase(this.orderRepo, this.internmentRepo)
      .execute(req.params['internmentId'] as string, query)
    sendPaginated(res, SUCCESS_MESSAGES.SUPPLY_ORDER.LIST, result.items, {
      page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages,
    })
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    const result = await new GetSupplyOrderUseCase(this.orderRepo)
      .execute(req.params['supplyOrderId'] as string, req.params['internmentId'] as string)
    sendOk(res, SUCCESS_MESSAGES.SUPPLY_ORDER.FOUND, result)
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const result = await new CreateSupplyOrderUseCase(this.orderRepo, this.internmentRepo)
      .execute(
        req.params['internmentId'] as string,
        req.body as CreateSupplyOrderDto,
        req.user!.companyId,
        req.user!.userId
      )
    sendCreated(res, SUCCESS_MESSAGES.SUPPLY_ORDER.CREATED, result)
  }

  send = async (req: Request, res: Response): Promise<void> => {
    const result = await new SendSupplyOrderUseCase(this.orderRepo, this.internmentRepo, this.stockRepo)
      .execute(req.params['internmentId'] as string, req.params['supplyOrderId'] as string, req.user!.companyId)
    sendOk(res, SUCCESS_MESSAGES.SUPPLY_ORDER.SENT, result)
  }

  cancel = async (req: Request, res: Response): Promise<void> => {
    const result = await new CancelSupplyOrderUseCase(this.orderRepo, this.internmentRepo)
      .execute(
        req.params['internmentId'] as string,
        req.params['supplyOrderId'] as string,
        req.body as CancelSupplyOrderDto
      )
    sendOk(res, SUCCESS_MESSAGES.SUPPLY_ORDER.CANCELLED, result)
  }

  addItem = async (req: Request, res: Response): Promise<void> => {
    const result = await new AddSupplyOrderItemUseCase(this.orderRepo, this.supplyRepo)
      .execute(
        req.params['internmentId'] as string,
        req.params['supplyOrderId'] as string,
        req.body as AddSupplyOrderItemDto,
        req.user!.companyId
      )
    sendCreated(res, SUCCESS_MESSAGES.SUPPLY_ORDER_ITEM.ADDED, result)
  }

  removeItem = async (req: Request, res: Response): Promise<void> => {
    await new RemoveSupplyOrderItemUseCase(this.orderRepo)
      .execute(
        req.params['internmentId'] as string,
        req.params['supplyOrderId'] as string,
        req.params['itemId'] as string
      )
    sendNoContent(res)
  }
}
