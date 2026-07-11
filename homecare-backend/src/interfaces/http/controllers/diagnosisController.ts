import type { Request, Response } from 'express'
import { DiagnosisRepository } from '../../../infrastructure/database/repositories/diagnosisRepository.js'
import { InternmentRepository } from '../../../infrastructure/database/repositories/internmentRepository.js'
import { CreateDiagnosisUseCase } from '../../../application/useCases/diagnosis/createDiagnosisUseCase.js'
import { ListDiagnosesUseCase } from '../../../application/useCases/diagnosis/listDiagnosesUseCase.js'
import { UpdateDiagnosisUseCase } from '../../../application/useCases/diagnosis/updateDiagnosisUseCase.js'
import { sendOk, sendCreated } from '../../../shared/helpers/responseHelper.js'
import { SUCCESS_MESSAGES } from '../../../shared/constants/messages.js'
import type { CreateDiagnosisDto, UpdateDiagnosisDto } from '../schemas/diagnosisSchema.js'

export class DiagnosisController {
  private readonly diagnosisRepo  = new DiagnosisRepository()
  private readonly internmentRepo = new InternmentRepository()

  list = async (req: Request, res: Response): Promise<void> => {
    const result = await new ListDiagnosesUseCase(this.diagnosisRepo, this.internmentRepo)
      .execute(req.params['internmentId'] as string)
    sendOk(res, SUCCESS_MESSAGES.DIAGNOSIS.LIST, result)
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const result = await new CreateDiagnosisUseCase(this.diagnosisRepo, this.internmentRepo)
      .execute(req.params['internmentId'] as string, req.body as CreateDiagnosisDto)
    sendCreated(res, SUCCESS_MESSAGES.DIAGNOSIS.CREATED, result)
  }

  update = async (req: Request, res: Response): Promise<void> => {
    const result = await new UpdateDiagnosisUseCase(this.diagnosisRepo, this.internmentRepo)
      .execute(
        req.params['internmentId'] as string,
        req.params['diagnosisId'] as string,
        req.body as UpdateDiagnosisDto
      )
    sendOk(res, SUCCESS_MESSAGES.DIAGNOSIS.UPDATED, result)
  }
}
