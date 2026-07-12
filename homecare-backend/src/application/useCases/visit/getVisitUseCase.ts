import type { IVisitRepository } from '../../../domain/repositories/iVisitRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { VisitMapper } from '../../../interfaces/http/mappers/visitMapper.js'
import type { VisitResponseDto } from '../../../interfaces/http/dtos/visitDto.js'

export class GetVisitUseCase {
  constructor(private readonly visitRepository: IVisitRepository) {}

  async execute(id: string, internmentId: string): Promise<VisitResponseDto> {
    const visit = await this.visitRepository.findById(id, internmentId)
    if (!visit) throw new AppError(404, ERROR_MESSAGES.VISIT.NOT_FOUND)
    return VisitMapper.toDto(visit)
  }
}
