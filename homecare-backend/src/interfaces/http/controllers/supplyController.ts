import type { Request, Response } from 'express'
import { SupplyRepository } from '../../../infrastructure/database/repositories/supplyRepository.js'
import { CreateSupplyUseCase } from '../../../application/useCases/supply/createSupplyUseCase.js'
import { GetSupplyUseCase } from '../../../application/useCases/supply/getSupplyUseCase.js'
import { ListSuppliesUseCase } from '../../../application/useCases/supply/listSuppliesUseCase.js'
import { UpdateSupplyUseCase } from '../../../application/useCases/supply/updateSupplyUseCase.js'
import { DeleteSupplyUseCase } from '../../../application/useCases/supply/deleteSupplyUseCase.js'
import { sendOk, sendCreated, sendNoContent, sendPaginated } from '../../../shared/helpers/responseHelper.js'
import { SUCCESS_MESSAGES } from '../../../shared/constants/messages.js'
import type { CreateSupplyDto, UpdateSupplyDto, SupplyQuery } from '../schemas/supplySchema.js'

export class SupplyController {
  private readonly repo = new SupplyRepository()

  list = async (req: Request, res: Response): Promise<void> => {
    const query  = req.query as unknown as SupplyQuery
    const result = await new ListSuppliesUseCase(this.repo)
      .execute(query, req.user!.companyId)
    sendPaginated(res, SUCCESS_MESSAGES.SUPPLY.LIST, result.items, {
      page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages,
    })
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    const result = await new GetSupplyUseCase(this.repo)
      .execute(req.params['id'] as string, req.user!.companyId)
    sendOk(res, SUCCESS_MESSAGES.SUPPLY.FOUND, result)
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const result = await new CreateSupplyUseCase(this.repo)
      .execute(req.body as CreateSupplyDto, req.user!.companyId)
    sendCreated(res, SUCCESS_MESSAGES.SUPPLY.CREATED, result)
  }

  update = async (req: Request, res: Response): Promise<void> => {
    const result = await new UpdateSupplyUseCase(this.repo)
      .execute(req.params['id'] as string, req.body as UpdateSupplyDto, req.user!.companyId)
    sendOk(res, SUCCESS_MESSAGES.SUPPLY.UPDATED, result)
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    await new DeleteSupplyUseCase(this.repo)
      .execute(req.params['id'] as string, req.user!.companyId)
    sendNoContent(res)
  }
}
