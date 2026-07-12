import type { IIncidentRepository } from '../../../domain/repositories/iIncidentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { IncidentMapper } from '../../../interfaces/http/mappers/incidentMapper.js'
import type { IncidentResponseDto } from '../../../interfaces/http/dtos/incidentDto.js'

export class GetIncidentUseCase {
  constructor(private readonly incidentRepository: IIncidentRepository) {}

  async execute(id: string, internmentId: string): Promise<IncidentResponseDto> {
    const incident = await this.incidentRepository.findById(id, internmentId)
    if (!incident) throw new AppError(404, ERROR_MESSAGES.INCIDENT.NOT_FOUND)
    return IncidentMapper.toDto(incident)
  }
}
