import type { Request, Response } from 'express'
import { InternmentRepository } from '../../../infrastructure/database/repositories/internmentRepository.js'
import { CreateInternmentUseCase } from '../../../application/useCases/internment/createInternmentUseCase.js'
import { GetInternmentUseCase } from '../../../application/useCases/internment/getInternmentUseCase.js'
import { ListInternmentsUseCase } from '../../../application/useCases/internment/listInternmentsUseCase.js'
import { UpdateInternmentUseCase } from '../../../application/useCases/internment/updateInternmentUseCase.js'
import { DischargeInternmentUseCase } from '../../../application/useCases/internment/dischargeInternmentUseCase.js'
import { DeleteInternmentUseCase } from '../../../application/useCases/internment/deleteInternmentUseCase.js'
import { sendOk, sendCreated, sendNoContent, sendPaginated } from '../../../shared/helpers/responseHelper.js'
import { SUCCESS_MESSAGES } from '../../../shared/constants/messages.js'
import type {
  CreateInternmentDto,
  UpdateInternmentDto,
  DischargeInternmentDto,
  InternmentQuery,
} from '../schemas/internmentSchema.js'

export class InternmentController {
  private readonly repo = new InternmentRepository()

  list = async (req: Request, res: Response): Promise<void> => {
    const query  = req.query as unknown as InternmentQuery
    const result = await new ListInternmentsUseCase(this.repo).execute(query)
    sendPaginated(res, SUCCESS_MESSAGES.INTERNMENT.LIST, result.items, {
      page:       result.page,
      limit:      result.limit,
      total:      result.total,
      totalPages: result.totalPages,
    })
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    const result = await new GetInternmentUseCase(this.repo).execute(req.params['id'] as string)
    sendOk(res, SUCCESS_MESSAGES.INTERNMENT.FOUND, result)
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const result = await new CreateInternmentUseCase(this.repo).execute(
      req.body as CreateInternmentDto
    )
    sendCreated(res, SUCCESS_MESSAGES.INTERNMENT.CREATED, result)
  }

  update = async (req: Request, res: Response): Promise<void> => {
    const result = await new UpdateInternmentUseCase(this.repo).execute(
      req.params['id'] as string,
      req.body as UpdateInternmentDto
    )
    sendOk(res, SUCCESS_MESSAGES.INTERNMENT.UPDATED, result)
  }

  discharge = async (req: Request, res: Response): Promise<void> => {
    const result = await new DischargeInternmentUseCase(this.repo).execute(
      req.params['id'] as string,
      req.body as DischargeInternmentDto
    )
    sendOk(res, SUCCESS_MESSAGES.INTERNMENT.DISCHARGED, result)
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    await new DeleteInternmentUseCase(this.repo).execute(req.params['id'] as string)
    sendNoContent(res)
  }
}
