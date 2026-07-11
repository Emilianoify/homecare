import type { IDiagnosisRepository } from '../../../domain/repositories/iDiagnosisRepository.js'
import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { DiagnosisMapper } from '../../../interfaces/http/mappers/diagnosisMapper.js'
import type { UpdateDiagnosisDto } from '../../../interfaces/http/schemas/diagnosisSchema.js'
import type { DiagnosisResponseDto } from '../../../interfaces/http/dtos/diagnosisDto.js'

export class UpdateDiagnosisUseCase {
  constructor(
    private readonly diagnosisRepository:  IDiagnosisRepository,
    private readonly internmentRepository: IInternmentRepository
  ) {}

  async execute(
    internmentId: string,
    diagnosisId:  string,
    dto:          UpdateDiagnosisDto
  ): Promise<DiagnosisResponseDto> {
    const internment = await this.internmentRepository.findById(internmentId)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    const diagnosis = await this.diagnosisRepository.findById(diagnosisId, internmentId)
    if (!diagnosis) throw new AppError(404, ERROR_MESSAGES.DIAGNOSIS.NOT_FOUND)

    const { dateTo, ...rest } = dto

    const updated = await this.diagnosisRepository.update(diagnosisId, {
      ...rest,
      ...(dateTo !== undefined && {
        dateTo: dateTo ? new Date(dateTo) : null,
      }),
    })

    return DiagnosisMapper.toDto(updated)
  }
}
