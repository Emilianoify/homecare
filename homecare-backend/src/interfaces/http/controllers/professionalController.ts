import type { Request, Response } from 'express'
import { ProfessionalRepository } from '../../../infrastructure/database/repositories/professionalRepository.js'
import { CreateProfessionalUseCase } from '../../../application/useCases/professional/createProfessionalUseCase.js'
import { GetProfessionalUseCase } from '../../../application/useCases/professional/getProfessionalUseCase.js'
import { ListProfessionalsUseCase } from '../../../application/useCases/professional/listProfessionalsUseCase.js'
import { UpdateProfessionalUseCase } from '../../../application/useCases/professional/updateProfessionalUseCase.js'
import { DeleteProfessionalUseCase } from '../../../application/useCases/professional/deleteProfessionalUseCase.js'
import { sendOk, sendCreated, sendNoContent, sendPaginated } from '../../../shared/helpers/responseHelper.js'
import { SUCCESS_MESSAGES } from '../../../shared/constants/messages.js'
import type { CreateProfessionalDto, UpdateProfessionalDto, ProfessionalQuery } from '../schemas/professionalSchema.js'

export class ProfessionalController {
  private readonly repo = new ProfessionalRepository()

  list = async (req: Request, res: Response): Promise<void> => {
    const query  = req.query as unknown as ProfessionalQuery
    const result = await new ListProfessionalsUseCase(this.repo).execute(query, req.user!.companyId)
    sendPaginated(res, SUCCESS_MESSAGES.PROFESSIONAL.LIST, result.items, {
      page:       result.page,
      limit:      result.limit,
      total:      result.total,
      totalPages: result.totalPages,
    })
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    const result = await new GetProfessionalUseCase(this.repo).execute(
      req.params['id'] as string,
      req.user!.companyId
    )
    sendOk(res, SUCCESS_MESSAGES.PROFESSIONAL.FOUND, result)
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const result = await new CreateProfessionalUseCase(this.repo).execute(
      req.body as CreateProfessionalDto,
      req.user!.companyId
    )
    sendCreated(res, SUCCESS_MESSAGES.PROFESSIONAL.CREATED, result)
  }

  update = async (req: Request, res: Response): Promise<void> => {
    const result = await new UpdateProfessionalUseCase(this.repo).execute(
      req.params['id'] as string,
      req.body as UpdateProfessionalDto,
      req.user!.companyId
    )
    sendOk(res, SUCCESS_MESSAGES.PROFESSIONAL.UPDATED, result)
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    await new DeleteProfessionalUseCase(this.repo).execute(
      req.params['id'] as string,
      req.user!.companyId
    )
    sendNoContent(res)
  }
}
