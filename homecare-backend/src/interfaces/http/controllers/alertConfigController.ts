import type { Request, Response } from 'express'
import { AlertConfigRepository } from '../../../infrastructure/database/repositories/alertConfigRepository.js'
import { CreateAlertConfigUseCase } from '../../../application/useCases/alertConfig/createAlertConfigUseCase.js'
import { ListAlertConfigsUseCase } from '../../../application/useCases/alertConfig/listAlertConfigsUseCase.js'
import { GetAlertConfigUseCase } from '../../../application/useCases/alertConfig/getAlertConfigUseCase.js'
import { UpdateAlertConfigUseCase } from '../../../application/useCases/alertConfig/updateAlertConfigUseCase.js'
import { DeleteAlertConfigUseCase } from '../../../application/useCases/alertConfig/deleteAlertConfigUseCase.js'
import { sendOk, sendCreated, sendNoContent } from '../../../shared/helpers/responseHelper.js'
import { SUCCESS_MESSAGES } from '../../../shared/constants/messages.js'
import type {
  CreateAlertConfigDto,
  UpdateAlertConfigDto,
  AlertConfigQuery,
} from '../schemas/alertConfigSchema.js'

export class AlertConfigController {
  private readonly repo = new AlertConfigRepository()

  list = async (req: Request, res: Response): Promise<void> => {
    const query  = req.query as unknown as AlertConfigQuery
    const result = await new ListAlertConfigsUseCase(this.repo)
      .execute(req.user!.companyId, query)
    sendOk(res, SUCCESS_MESSAGES.ALERT_CONFIG.LIST, result)
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    const result = await new GetAlertConfigUseCase(this.repo)
      .execute(req.params['id'] as string, req.user!.companyId)
    sendOk(res, SUCCESS_MESSAGES.ALERT_CONFIG.FOUND, result)
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const result = await new CreateAlertConfigUseCase(this.repo)
      .execute(req.body as CreateAlertConfigDto, req.user!.companyId)
    sendCreated(res, SUCCESS_MESSAGES.ALERT_CONFIG.CREATED, result)
  }

  update = async (req: Request, res: Response): Promise<void> => {
    const result = await new UpdateAlertConfigUseCase(this.repo)
      .execute(req.params['id'] as string, req.body as UpdateAlertConfigDto, req.user!.companyId)
    sendOk(res, SUCCESS_MESSAGES.ALERT_CONFIG.UPDATED, result)
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    await new DeleteAlertConfigUseCase(this.repo)
      .execute(req.params['id'] as string, req.user!.companyId)
    sendNoContent(res)
  }
}
