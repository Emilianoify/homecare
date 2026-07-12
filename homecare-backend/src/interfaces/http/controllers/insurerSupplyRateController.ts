import type { Request, Response } from 'express'
import { InsurerSupplyRateRepository } from '../../../infrastructure/database/repositories/insurerSupplyRateRepository.js'
import { HealthInsurerRepository } from '../../../infrastructure/database/repositories/healthInsurerRepository.js'
import { SupplyRepository } from '../../../infrastructure/database/repositories/supplyRepository.js'
import { CreateInsurerSupplyRateUseCase } from '../../../application/useCases/insurerSupplyRate/createInsurerSupplyRateUseCase.js'
import { ListInsurerSupplyRatesUseCase } from '../../../application/useCases/insurerSupplyRate/listInsurerSupplyRatesUseCase.js'
import { UpdateInsurerSupplyRateUseCase } from '../../../application/useCases/insurerSupplyRate/updateInsurerSupplyRateUseCase.js'
import { DeleteInsurerSupplyRateUseCase } from '../../../application/useCases/insurerSupplyRate/deleteInsurerSupplyRateUseCase.js'
import { sendOk, sendCreated, sendNoContent } from '../../../shared/helpers/responseHelper.js'
import { SUCCESS_MESSAGES } from '../../../shared/constants/messages.js'
import type {
  CreateInsurerSupplyRateDto,
  UpdateInsurerSupplyRateDto,
  InsurerSupplyRateQuery,
} from '../schemas/insurerSupplyRateSchema.js'

export class InsurerSupplyRateController {
  private readonly supplyRateRepo = new InsurerSupplyRateRepository()
  private readonly insurerRepo    = new HealthInsurerRepository()
  private readonly supplyRepo     = new SupplyRepository()

  list = async (req: Request, res: Response): Promise<void> => {
    const query  = req.query as unknown as InsurerSupplyRateQuery
    const result = await new ListInsurerSupplyRatesUseCase(this.supplyRateRepo, this.insurerRepo)
      .execute(req.params['healthInsurerId'] as string, req.user!.companyId, query.onlyActive)
    sendOk(res, SUCCESS_MESSAGES.INSURER_SUPPLY_RATE.LIST, result)
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const result = await new CreateInsurerSupplyRateUseCase(
      this.supplyRateRepo, this.insurerRepo, this.supplyRepo
    ).execute(
      req.params['healthInsurerId'] as string,
      req.body as CreateInsurerSupplyRateDto,
      req.user!.companyId
    )
    sendCreated(res, SUCCESS_MESSAGES.INSURER_SUPPLY_RATE.CREATED, result)
  }

  update = async (req: Request, res: Response): Promise<void> => {
    const result = await new UpdateInsurerSupplyRateUseCase(this.supplyRateRepo, this.insurerRepo)
      .execute(
        req.params['healthInsurerId'] as string,
        req.params['supplyRateId'] as string,
        req.body as UpdateInsurerSupplyRateDto,
        req.user!.companyId
      )
    sendOk(res, SUCCESS_MESSAGES.INSURER_SUPPLY_RATE.UPDATED, result)
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    await new DeleteInsurerSupplyRateUseCase(this.supplyRateRepo, this.insurerRepo)
      .execute(req.params['healthInsurerId'] as string, req.params['supplyRateId'] as string, req.user!.companyId)
    sendNoContent(res)
  }
}
