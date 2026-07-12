import type { IIncidentRepository } from '../../../domain/repositories/iIncidentRepository.js'
import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { IncidentMapper } from '../../../interfaces/http/mappers/incidentMapper.js'
import type { CreateIncidentDto } from '../../../interfaces/http/schemas/incidentSchema.js'
import type { IncidentResponseDto } from '../../../interfaces/http/dtos/incidentDto.js'

export class CreateIncidentUseCase {
  constructor(
    private readonly incidentRepository:   IIncidentRepository,
    private readonly internmentRepository: IInternmentRepository
  ) {}

  async execute(
    internmentId: string,
    dto:          CreateIncidentDto,
    reportedById: string
  ): Promise<IncidentResponseDto> {
    const internment = await this.internmentRepository.findById(internmentId)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    const incident = await this.incidentRepository.create({
      internmentId,
      reportedById,
      type:        dto.type,
      severity:    dto.severity,
      status:      'OPEN',
      description: dto.description,
      resolution:  null,
      occurredAt:  new Date(dto.occurredAt),
      resolvedAt:  null,
    })

    return IncidentMapper.toDto(incident)
  }
}
