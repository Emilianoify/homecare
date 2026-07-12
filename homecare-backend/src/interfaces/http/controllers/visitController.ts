import type { Request, Response } from 'express'
import { VisitRepository } from '../../../infrastructure/database/repositories/visitRepository.js'
import { InternmentRepository } from '../../../infrastructure/database/repositories/internmentRepository.js'
import { ProfessionalRepository } from '../../../infrastructure/database/repositories/professionalRepository.js'
import { CreateVisitUseCase } from '../../../application/useCases/visit/createVisitUseCase.js'
import { ListVisitsUseCase } from '../../../application/useCases/visit/listVisitsUseCase.js'
import { GetVisitUseCase } from '../../../application/useCases/visit/getVisitUseCase.js'
import { MarkVisitMissedUseCase } from '../../../application/useCases/visit/markVisitMissedUseCase.js'
import { sendOk, sendCreated, sendPaginated } from '../../../shared/helpers/responseHelper.js'
import { SUCCESS_MESSAGES } from '../../../shared/constants/messages.js'
import type { CreateVisitDto, MarkMissedDto, VisitQuery } from '../schemas/visitSchema.js'

export class VisitController {
  private readonly visitRepo        = new VisitRepository()
  private readonly internmentRepo   = new InternmentRepository()
  private readonly professionalRepo = new ProfessionalRepository()

  list = async (req: Request, res: Response): Promise<void> => {
    const query  = req.query as unknown as VisitQuery
    const result = await new ListVisitsUseCase(this.visitRepo, this.internmentRepo)
      .execute(req.params['internmentId'] as string, query)
    sendPaginated(res, SUCCESS_MESSAGES.VISIT.LIST, result.items, {
      page:       result.page,
      limit:      result.limit,
      total:      result.total,
      totalPages: result.totalPages,
    })
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    const result = await new GetVisitUseCase(this.visitRepo)
      .execute(req.params['visitId'] as string, req.params['internmentId'] as string)
    sendOk(res, SUCCESS_MESSAGES.VISIT.FOUND, result)
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const result = await new CreateVisitUseCase(
      this.visitRepo,
      this.internmentRepo,
      this.professionalRepo
    ).execute(
      req.params['internmentId'] as string,
      req.body as CreateVisitDto,
      req.user!.companyId
    )
    sendCreated(res, SUCCESS_MESSAGES.VISIT.CREATED, result)
  }

  markMissed = async (req: Request, res: Response): Promise<void> => {
    const result = await new MarkVisitMissedUseCase(this.visitRepo, this.internmentRepo)
      .execute(
        req.params['internmentId'] as string,
        req.params['visitId'] as string,
        req.body as MarkMissedDto
      )
    sendOk(res, SUCCESS_MESSAGES.VISIT.MISSED, result)
  }
}
