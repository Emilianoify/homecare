import type { IIncidentRepository } from '../../../domain/repositories/iIncidentRepository.js'
import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { IncidentMapper } from '../../../interfaces/http/mappers/incidentMapper.js'
import type { IncidentQuery } from '../../../interfaces/http/schemas/incidentSchema.js'
import type { IncidentListResultDto } from '../../../interfaces/http/dtos/incidentDto.js'

export class ListIncidentsUseCase {
  constructor(
    private readonly incidentRepository:   IIncidentRepository,
    private readonly internmentRepository: IInternmentRepository
  ) {}

  async execute(internmentId: string, query: IncidentQuery): Promise<IncidentListResultDto> {
    const internment = await this.internmentRepository.findById(internmentId)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    const { items, total } = await this.incidentRepository.findAll({
      internmentId,
      page:     query.page,
      limit:    query.limit,
      severity: query.severity,
      status:   query.status,
    })

    return {
      items:      items.map(IncidentMapper.toDto),
      page:       query.page,
      limit:      query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    }
  }
}
