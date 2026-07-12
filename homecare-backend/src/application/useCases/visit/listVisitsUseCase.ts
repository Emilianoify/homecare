import type { IVisitRepository } from '../../../domain/repositories/iVisitRepository.js'
import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { VisitMapper } from '../../../interfaces/http/mappers/visitMapper.js'
import type { VisitQuery } from '../../../interfaces/http/schemas/visitSchema.js'
import type { VisitListResultDto } from '../../../interfaces/http/dtos/visitDto.js'

export class ListVisitsUseCase {
  constructor(
    private readonly visitRepository:      IVisitRepository,
    private readonly internmentRepository: IInternmentRepository
  ) {}

  async execute(internmentId: string, query: VisitQuery): Promise<VisitListResultDto> {
    const internment = await this.internmentRepository.findById(internmentId)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    const { items, total } = await this.visitRepository.findAll({
      internmentId,
      page:           query.page,
      limit:          query.limit,
      professionalId: query.professionalId,
      status:         query.status,
      dateFrom:       query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo:         query.dateTo   ? new Date(query.dateTo)   : undefined,
    })

    return {
      items:      items.map((item) => VisitMapper.toDto(item)),
      page:       query.page,
      limit:      query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    }
  }
}
