import type { IDiagnosisRepository } from '../../../domain/repositories/iDiagnosisRepository.js'
import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { DiagnosisMapper } from '../../../interfaces/http/mappers/diagnosisMapper.js'
import type { DiagnosisResponseDto } from '../../../interfaces/http/dtos/diagnosisDto.js'

export class ListDiagnosesUseCase {
  constructor(
    private readonly diagnosisRepository:  IDiagnosisRepository,
    private readonly internmentRepository: IInternmentRepository
  ) {}

  async execute(internmentId: string): Promise<DiagnosisResponseDto[]> {
    const internment = await this.internmentRepository.findById(internmentId)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    const diagnoses = await this.diagnosisRepository.findAllByInternment(internmentId)
    return diagnoses.map(DiagnosisMapper.toDto)
  }
}
