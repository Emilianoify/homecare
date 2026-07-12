import type { IIncidentRepository } from '../../../domain/repositories/iIncidentRepository.js'
import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { IncidentMapper } from '../../../interfaces/http/mappers/incidentMapper.js'
import type { UpdateIncidentStatusDto } from '../../../interfaces/http/schemas/incidentSchema.js'
import type { IncidentResponseDto } from '../../../interfaces/http/dtos/incidentDto.js'

export class UpdateIncidentStatusUseCase {
  constructor(
    private readonly incidentRepository:   IIncidentRepository,
    private readonly internmentRepository: IInternmentRepository
  ) {}

  async execute(
    internmentId: string,
    incidentId:   string,
    dto:          UpdateIncidentStatusDto
  ): Promise<IncidentResponseDto> {
    const internment = await this.internmentRepository.findById(internmentId)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    const incident = await this.incidentRepository.findById(incidentId, internmentId)
    if (!incident) throw new AppError(404, ERROR_MESSAGES.INCIDENT.NOT_FOUND)

    if (incident.status === 'RESOLVED' || incident.status === 'CLOSED') {
      throw new AppError(409, ERROR_MESSAGES.INCIDENT.ALREADY_RESOLVED)
    }

    const updated = await this.incidentRepository.updateStatus(incidentId, dto.status)
    return IncidentMapper.toDto(updated)
  }
}
