import type { IDiagnosisRepository } from '../../../domain/repositories/iDiagnosisRepository.js'
import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { DiagnosisMapper } from '../../../interfaces/http/mappers/diagnosisMapper.js'
import type { CreateDiagnosisDto } from '../../../interfaces/http/schemas/diagnosisSchema.js'
import type { DiagnosisResponseDto } from '../../../interfaces/http/dtos/diagnosisDto.js'

export class CreateDiagnosisUseCase {
  constructor(
    private readonly diagnosisRepository:  IDiagnosisRepository,
    private readonly internmentRepository: IInternmentRepository
  ) {}

  async execute(
    internmentId: string,
    dto: CreateDiagnosisDto
  ): Promise<DiagnosisResponseDto> {
    const internment = await this.internmentRepository.findById(internmentId)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    // Si es PRIMARY, verificar que no exista otro activo
    if (dto.type === 'PRIMARY') {
      const existing = await this.diagnosisRepository.findActivePrimary(internmentId)
      if (existing) throw new AppError(409, ERROR_MESSAGES.DIAGNOSIS.PRIMARY_EXISTS)
    }

    const diagnosis = await this.diagnosisRepository.create({
      internmentId,
      cie10Code:        dto.cie10Code,
      cie10Description: dto.cie10Description,
      type:             dto.type,
      status:           dto.status,
      dateFrom:         new Date(dto.dateFrom),
      dateTo:           dto.dateTo ? new Date(dto.dateTo) : null,
    })

    return DiagnosisMapper.toDto(diagnosis)
  }
}
