import type { Request, Response } from 'express'
import { InsurerRateRepository } from '../../../infrastructure/database/repositories/insurerRateRepository.js'
import { HealthInsurerRepository } from '../../../infrastructure/database/repositories/healthInsurerRepository.js'
import { ServiceItemRepository } from '../../../infrastructure/database/repositories/serviceItemRepository.js'
import { CreateInsurerRateUseCase } from '../../../application/useCases/insurerRate/createInsurerRateUseCase.js'
import { ListInsurerRatesUseCase } from '../../../application/useCases/insurerRate/listInsurerRatesUseCase.js'
import { UpdateInsurerRateUseCase } from '../../../application/useCases/insurerRate/updateInsurerRateUseCase.js'
import { DeleteInsurerRateUseCase } from '../../../application/useCases/insurerRate/deleteInsurerRateUseCase.js'
import { sendOk, sendCreated, sendNoContent } from '../../../shared/helpers/responseHelper.js'
import { SUCCESS_MESSAGES } from '../../../shared/constants/messages.js'
import type { CreateInsurerRateDto, UpdateInsurerRateDto, InsurerRateQuery } from '../schemas/insurerRateSchema.js'

export class InsurerRateController {
  private readonly rateRepo    = new InsurerRateRepository()
  private readonly insurerRepo = new HealthInsurerRepository()
  private readonly itemRepo    = new ServiceItemRepository()

  list = async (req: Request, res: Response): Promise<void> => {
    const query  = req.query as unknown as InsurerRateQuery
    const result = await new ListInsurerRatesUseCase(this.rateRepo, this.insurerRepo).execute(
      req.params['healthInsurerId'] as string,
      req.user!.companyId,
      query.onlyActive
    )
    sendOk(res, SUCCESS_MESSAGES.INSURER_RATE.LIST, result)
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const result = await new CreateInsurerRateUseCase(this.rateRepo, this.insurerRepo, this.itemRepo).execute(
      req.params['healthInsurerId'] as string,
      req.body as CreateInsurerRateDto,
      req.user!.companyId
    )
    sendCreated(res, SUCCESS_MESSAGES.INSURER_RATE.CREATED, result)
  }

  update = async (req: Request, res: Response): Promise<void> => {
    const result = await new UpdateInsurerRateUseCase(this.rateRepo, this.insurerRepo).execute(
      req.params['healthInsurerId'] as string,
      req.params['rateId'] as string,
      req.body as UpdateInsurerRateDto,
      req.user!.companyId
    )
    sendOk(res, SUCCESS_MESSAGES.INSURER_RATE.UPDATED, result)
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    await new DeleteInsurerRateUseCase(this.rateRepo, this.insurerRepo).execute(
      req.params['healthInsurerId'] as string,
      req.params['rateId'] as string,
      req.user!.companyId
    )
    sendNoContent(res)
  }
}
