import type { Request, Response } from 'express'
import { FunctionalStatusRepository } from '../../../infrastructure/database/repositories/functionalStatusRepository.js'
import { PatientRepository } from '../../../infrastructure/database/repositories/patientRepository.js'
import { InternmentRepository } from '../../../infrastructure/database/repositories/internmentRepository.js'
import { CreateFunctionalStatusUseCase } from '../../../application/useCases/functionalStatus/createFunctionalStatusUseCase.js'
import { ListFunctionalStatusUseCase } from '../../../application/useCases/functionalStatus/listFunctionalStatusUseCase.js'
import { GetLatestFunctionalStatusUseCase } from '../../../application/useCases/functionalStatus/getLatestFunctionalStatusUseCase.js'
import { sendOk, sendCreated } from '../../../shared/helpers/responseHelper.js'
import { SUCCESS_MESSAGES } from '../../../shared/constants/messages.js'
import type { CreateFunctionalStatusDto } from '../schemas/functionalStatusSchema.js'

export class FunctionalStatusController {
  private readonly fsRepo         = new FunctionalStatusRepository()
  private readonly patientRepo    = new PatientRepository()
  private readonly internmentRepo = new InternmentRepository()

  list = async (req: Request, res: Response): Promise<void> => {
    const internmentId = req.query['internmentId'] as string | undefined
    const result = await new ListFunctionalStatusUseCase(this.fsRepo, this.patientRepo)
      .execute(req.params['patientId'] as string, req.user!.companyId, internmentId)
    sendOk(res, SUCCESS_MESSAGES.FUNCTIONAL_STATUS.LIST, result)
  }

  latest = async (req: Request, res: Response): Promise<void> => {
    const result = await new GetLatestFunctionalStatusUseCase(this.fsRepo, this.patientRepo)
      .execute(req.params['patientId'] as string, req.user!.companyId)
    sendOk(res, SUCCESS_MESSAGES.FUNCTIONAL_STATUS.LATEST, result)
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const result = await new CreateFunctionalStatusUseCase(
      this.fsRepo,
      this.patientRepo,
      this.internmentRepo
    ).execute(
      req.params['patientId'] as string,
      req.body as CreateFunctionalStatusDto,
      req.user!.companyId,
      req.user!.userId
    )
    sendCreated(res, SUCCESS_MESSAGES.FUNCTIONAL_STATUS.CREATED, result)
  }
}
