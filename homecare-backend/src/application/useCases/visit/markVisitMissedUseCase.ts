import type { IVisitRepository } from '../../../domain/repositories/iVisitRepository.js'
import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { VisitMapper } from '../../../interfaces/http/mappers/visitMapper.js'
import type { MarkMissedDto } from '../../../interfaces/http/schemas/visitSchema.js'
import type { VisitResponseDto } from '../../../interfaces/http/dtos/visitDto.js'

export class MarkVisitMissedUseCase {
  constructor(
    private readonly visitRepository:      IVisitRepository,
    private readonly internmentRepository: IInternmentRepository
  ) {}

  async execute(
    internmentId: string,
    visitId:      string,
    dto:          MarkMissedDto
  ): Promise<VisitResponseDto> {
    const internment = await this.internmentRepository.findById(internmentId)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    const visit = await this.visitRepository.findById(visitId, internmentId)
    if (!visit) throw new AppError(404, ERROR_MESSAGES.VISIT.NOT_FOUND)

    if (visit.billed) throw new AppError(409, ERROR_MESSAGES.VISIT.ALREADY_BILLED)
    if (visit.status === 'MISSED') throw new AppError(409, ERROR_MESSAGES.VISIT.ALREADY_MISSED)

    const updated = await this.visitRepository.markMissed(visitId, dto.missedReason)
    return VisitMapper.toDto(updated)
  }
}
