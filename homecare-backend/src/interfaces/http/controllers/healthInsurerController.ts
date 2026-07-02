import type { Request, Response } from 'express'
import { HealthInsurerRepository } from '../../../infrastructure/database/repositories/healthInsurerRepository.js'
import { CreateHealthInsurerUseCase } from '../../../application/useCases/healthInsurer/createHealthInsurerUseCase.js'
import { GetHealthInsurerUseCase } from '../../../application/useCases/healthInsurer/getHealthInsurerUseCase.js'
import { ListHealthInsurersUseCase } from '../../../application/useCases/healthInsurer/listHealthInsurersUseCase.js'
import { UpdateHealthInsurerUseCase } from '../../../application/useCases/healthInsurer/updateHealthInsurerUseCase.js'
import { DeleteHealthInsurerUseCase } from '../../../application/useCases/healthInsurer/deleteHealthInsurerUseCase.js'
import { sendOk, sendCreated, sendNoContent, sendPaginated } from '../../../shared/helpers/responseHelper.js'
import { SUCCESS_MESSAGES } from '../../../shared/constants/messages.js'
import type { CreateHealthInsurerDto, UpdateHealthInsurerDto, HealthInsurerQuery } from '../schemas/healthInsurerSchema.js'

export class HealthInsurerController {
  private readonly repo = new HealthInsurerRepository()

  list = async (req: Request, res: Response): Promise<void> => {
    const query  = req.query as unknown as HealthInsurerQuery
    const result = await new ListHealthInsurersUseCase(this.repo).execute(query, req.user!.companyId)
    sendPaginated(res, SUCCESS_MESSAGES.HEALTH_INSURER.LIST, result.items, {
      page:       result.page,
      limit:      result.limit,
      total:      result.total,
      totalPages: result.totalPages,
    })
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    const result = await new GetHealthInsurerUseCase(this.repo).execute(
      req.params['id'] as string,
      req.user!.companyId
    )
    sendOk(res, SUCCESS_MESSAGES.HEALTH_INSURER.FOUND, result)
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const result = await new CreateHealthInsurerUseCase(this.repo).execute(
      req.body as CreateHealthInsurerDto,
      req.user!.companyId
    )
    sendCreated(res, SUCCESS_MESSAGES.HEALTH_INSURER.CREATED, result)
  }

  update = async (req: Request, res: Response): Promise<void> => {
    const result = await new UpdateHealthInsurerUseCase(this.repo).execute(
      req.params['id'] as string,
      req.body as UpdateHealthInsurerDto,
      req.user!.companyId
    )
    sendOk(res, SUCCESS_MESSAGES.HEALTH_INSURER.UPDATED, result)
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    await new DeleteHealthInsurerUseCase(this.repo).execute(
      req.params['id'] as string,
      req.user!.companyId
    )
    sendNoContent(res)
  }
}
