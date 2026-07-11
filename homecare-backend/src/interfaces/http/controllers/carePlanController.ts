import type { Request, Response } from 'express'
import { CarePlanRepository } from '../../../infrastructure/database/repositories/carePlanRepository.js'
import { InternmentRepository } from '../../../infrastructure/database/repositories/internmentRepository.js'
import { ProfessionalRepository } from '../../../infrastructure/database/repositories/professionalRepository.js'
import { AuthorizationRepository } from '../../../infrastructure/database/repositories/authorizationRepository.js'
import { CreateCarePlanUseCase } from '../../../application/useCases/carePlan/createCarePlanUseCase.js'
import { ListCarePlansUseCase } from '../../../application/useCases/carePlan/listCarePlansUseCase.js'
import { GetCarePlanUseCase } from '../../../application/useCases/carePlan/getCarePlanUseCase.js'
import { DeactivateCarePlanUseCase } from '../../../application/useCases/carePlan/deactivateCarePlanUseCase.js'
import { sendOk, sendCreated } from '../../../shared/helpers/responseHelper.js'
import { SUCCESS_MESSAGES } from '../../../shared/constants/messages.js'
import type { CreateCarePlanDto, CarePlanQuery } from '../schemas/carePlanSchema.js'

export class CarePlanController {
  private readonly carePlanRepo      = new CarePlanRepository()
  private readonly internmentRepo    = new InternmentRepository()
  private readonly professionalRepo  = new ProfessionalRepository()
  private readonly authorizationRepo = new AuthorizationRepository()

  list = async (req: Request, res: Response): Promise<void> => {
    const query  = req.query as unknown as CarePlanQuery
    const result = await new ListCarePlansUseCase(this.carePlanRepo, this.internmentRepo)
      .execute(req.params['internmentId'] as string, query.active)
    sendOk(res, SUCCESS_MESSAGES.CARE_PLAN.LIST, result)
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    const result = await new GetCarePlanUseCase(this.carePlanRepo)
      .execute(req.params['carePlanId'] as string, req.params['internmentId'] as string)
    sendOk(res, SUCCESS_MESSAGES.CARE_PLAN.FOUND, result)
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const result = await new CreateCarePlanUseCase(
      this.carePlanRepo,
      this.internmentRepo,
      this.professionalRepo,
      this.authorizationRepo
    ).execute(
      req.params['internmentId'] as string,
      req.body as CreateCarePlanDto,
      req.user!.companyId
    )
    sendCreated(res, SUCCESS_MESSAGES.CARE_PLAN.CREATED, result)
  }

  deactivate = async (req: Request, res: Response): Promise<void> => {
    const result = await new DeactivateCarePlanUseCase(this.carePlanRepo, this.internmentRepo)
      .execute(req.params['internmentId'] as string, req.params['carePlanId'] as string)
    sendOk(res, SUCCESS_MESSAGES.CARE_PLAN.DEACTIVATED, result)
  }
}
