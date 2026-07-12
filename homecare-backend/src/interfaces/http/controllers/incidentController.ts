import type { Request, Response } from 'express'
import { IncidentRepository } from '../../../infrastructure/database/repositories/incidentRepository.js'
import { InternmentRepository } from '../../../infrastructure/database/repositories/internmentRepository.js'
import { CreateIncidentUseCase } from '../../../application/useCases/incident/createIncidentUseCase.js'
import { ListIncidentsUseCase } from '../../../application/useCases/incident/listIncidentsUseCase.js'
import { GetIncidentUseCase } from '../../../application/useCases/incident/getIncidentUseCase.js'
import { UpdateIncidentStatusUseCase } from '../../../application/useCases/incident/updateIncidentStatusUseCase.js'
import { ResolveIncidentUseCase } from '../../../application/useCases/incident/resolveIncidentUseCase.js'
import { sendOk, sendCreated, sendPaginated } from '../../../shared/helpers/responseHelper.js'
import { SUCCESS_MESSAGES } from '../../../shared/constants/messages.js'
import type {
  CreateIncidentDto,
  UpdateIncidentStatusDto,
  ResolveIncidentDto,
  IncidentQuery,
} from '../schemas/incidentSchema.js'

export class IncidentController {
  private readonly incidentRepo   = new IncidentRepository()
  private readonly internmentRepo = new InternmentRepository()

  list = async (req: Request, res: Response): Promise<void> => {
    const query  = req.query as unknown as IncidentQuery
    const result = await new ListIncidentsUseCase(this.incidentRepo, this.internmentRepo)
      .execute(req.params['internmentId'] as string, query)
    sendPaginated(res, SUCCESS_MESSAGES.INCIDENT.LIST, result.items, {
      page:       result.page,
      limit:      result.limit,
      total:      result.total,
      totalPages: result.totalPages,
    })
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    const result = await new GetIncidentUseCase(this.incidentRepo)
      .execute(req.params['incidentId'] as string, req.params['internmentId'] as string)
    sendOk(res, SUCCESS_MESSAGES.INCIDENT.FOUND, result)
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const result = await new CreateIncidentUseCase(this.incidentRepo, this.internmentRepo)
      .execute(
        req.params['internmentId'] as string,
        req.body as CreateIncidentDto,
        req.user!.userId
      )
    sendCreated(res, SUCCESS_MESSAGES.INCIDENT.CREATED, result)
  }

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    const result = await new UpdateIncidentStatusUseCase(this.incidentRepo, this.internmentRepo)
      .execute(
        req.params['internmentId'] as string,
        req.params['incidentId'] as string,
        req.body as UpdateIncidentStatusDto
      )
    sendOk(res, SUCCESS_MESSAGES.INCIDENT.UPDATED, result)
  }

  resolve = async (req: Request, res: Response): Promise<void> => {
    const result = await new ResolveIncidentUseCase(this.incidentRepo, this.internmentRepo)
      .execute(
        req.params['internmentId'] as string,
        req.params['incidentId'] as string,
        req.body as ResolveIncidentDto
      )
    sendOk(res, SUCCESS_MESSAGES.INCIDENT.RESOLVED, result)
  }
}
