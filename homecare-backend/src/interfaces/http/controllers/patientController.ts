import type { Request, Response } from 'express'
import { PatientRepository } from '../../../infrastructure/database/repositories/patientRepository.js'
import { CreatePatientUseCase } from '../../../application/useCases/patient/createPatientUseCase.js'
import { GetPatientUseCase } from '../../../application/useCases/patient/getPatientUseCase.js'
import { ListPatientsUseCase } from '../../../application/useCases/patient/listPatientsUseCase.js'
import { UpdatePatientUseCase } from '../../../application/useCases/patient/updatePatientUseCase.js'
import { DeletePatientUseCase } from '../../../application/useCases/patient/deletePatientUseCase.js'
import { sendOk, sendCreated, sendNoContent, sendPaginated } from '../../../shared/helpers/responseHelper.js'
import { SUCCESS_MESSAGES } from '../../../shared/constants/messages.js'
import type { CreatePatientDto, UpdatePatientDto, PatientQuery } from '../schemas/patientSchema.js'

export class PatientController {
  private readonly repo = new PatientRepository()

  list = async (req: Request, res: Response): Promise<void> => {
    const query  = req.query as unknown as PatientQuery
    const result = await new ListPatientsUseCase(this.repo).execute(query, req.user!.companyId)
    sendPaginated(res, SUCCESS_MESSAGES.PATIENT.LIST, result.items, {
      page:       result.page,
      limit:      result.limit,
      total:      result.total,
      totalPages: result.totalPages,
    })
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    const result = await new GetPatientUseCase(this.repo).execute(req.params['id'] as string, req.user!.companyId)
    sendOk(res, SUCCESS_MESSAGES.PATIENT.FOUND, result)
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const result = await new CreatePatientUseCase(this.repo).execute(
      req.body as CreatePatientDto,
      req.user!.companyId
    )
    sendCreated(res, SUCCESS_MESSAGES.PATIENT.CREATED, result)
  }

  update = async (req: Request, res: Response): Promise<void> => {
    const result = await new UpdatePatientUseCase(this.repo).execute(
      req.params['id'] as string,
      req.body as UpdatePatientDto,
      req.user!.companyId
    )
    sendOk(res, SUCCESS_MESSAGES.PATIENT.UPDATED, result)
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    await new DeletePatientUseCase(this.repo).execute(req.params['id'] as string, req.user!.companyId)
    sendNoContent(res)
  }
}
