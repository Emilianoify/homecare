import type { Request, Response } from 'express'
import { MedicationRepository } from '../../../infrastructure/database/repositories/medicationRepository.js'
import { InternmentRepository } from '../../../infrastructure/database/repositories/internmentRepository.js'
import { CreateMedicationUseCase } from '../../../application/useCases/medication/createMedicationUseCase.js'
import { ListMedicationsUseCase } from '../../../application/useCases/medication/listMedicationsUseCase.js'
import { UpdateMedicationUseCase } from '../../../application/useCases/medication/updateMedicationUseCase.js'
import { DiscontinueMedicationUseCase } from '../../../application/useCases/medication/discontinueMedicationUseCase.js'
import { sendOk, sendCreated } from '../../../shared/helpers/responseHelper.js'
import { SUCCESS_MESSAGES } from '../../../shared/constants/messages.js'
import type {
  CreateMedicationDto,
  UpdateMedicationDto,
  DiscontinueMedicationDto,
  MedicationQuery,
} from '../schemas/medicationSchema.js'

export class MedicationController {
  private readonly medicationRepo = new MedicationRepository()
  private readonly internmentRepo = new InternmentRepository()

  list = async (req: Request, res: Response): Promise<void> => {
    const query  = req.query as unknown as MedicationQuery
    const result = await new ListMedicationsUseCase(this.medicationRepo, this.internmentRepo)
      .execute(req.params['internmentId'] as string, query.active)
    sendOk(res, SUCCESS_MESSAGES.MEDICATION.LIST, result)
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const result = await new CreateMedicationUseCase(this.medicationRepo, this.internmentRepo)
      .execute(
        req.params['internmentId'] as string,
        req.body as CreateMedicationDto,
        req.user!.userId
      )
    sendCreated(res, SUCCESS_MESSAGES.MEDICATION.CREATED, result)
  }

  update = async (req: Request, res: Response): Promise<void> => {
    const result = await new UpdateMedicationUseCase(this.medicationRepo, this.internmentRepo)
      .execute(
        req.params['internmentId'] as string,
        req.params['medicationId'] as string,
        req.body as UpdateMedicationDto
      )
    sendOk(res, SUCCESS_MESSAGES.MEDICATION.UPDATED, result)
  }

  discontinue = async (req: Request, res: Response): Promise<void> => {
    const result = await new DiscontinueMedicationUseCase(this.medicationRepo, this.internmentRepo)
      .execute(
        req.params['internmentId'] as string,
        req.params['medicationId'] as string,
        req.body as DiscontinueMedicationDto
      )
    sendOk(res, SUCCESS_MESSAGES.MEDICATION.DISCONTINUED, result)
  }
}
