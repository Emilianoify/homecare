import { createHash } from 'crypto'
import type { IClinicalNoteRepository } from '../../../domain/repositories/iClinicalNoteRepository.js'
import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { ClinicalNoteMapper } from '../../../interfaces/http/mappers/clinicalNoteMapper.js'
import type { CreateClinicalNoteDto } from '../../../interfaces/http/schemas/clinicalNoteSchema.js'
import type { ClinicalNoteResponseDto } from '../../../interfaces/http/dtos/clinicalNoteDto.js'

export class CreateClinicalNoteUseCase {
  constructor(
    private readonly clinicalNoteRepository: IClinicalNoteRepository,
    private readonly internmentRepository:   IInternmentRepository
  ) {}

  async execute(
    internmentId:   string,
    dto:            CreateClinicalNoteDto,
    professionalId: string
  ): Promise<ClinicalNoteResponseDto> {
    // Verificar que la internación existe
    const internment = await this.internmentRepository.findById(internmentId)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    // Verificar que la visita pertenece a esta internación
    // La visita se busca a través del repositorio de internación
    // que ya tiene el método findById — verificamos que visitId exista
    // en las visitas de esta internación consultando directamente
    const visitBelongs = await this.internmentRepository.findVisitByIdAndInternment(
      dto.visitId,
      internmentId
    )
    if (!visitBelongs) throw new AppError(404, ERROR_MESSAGES.CLINICAL_NOTE.VISIT_NOT_FOUND)

    // Verificar que la visita no tiene ya una nota
    const existing = await this.clinicalNoteRepository.findByVisit(dto.visitId)
    if (existing) throw new AppError(409, ERROR_MESSAGES.CLINICAL_NOTE.VISIT_HAS_NOTE)

    // Calcular hash SHA-256 del contenido
    const contentHash = createHash('sha256').update(dto.content).digest('hex')

    const note = await this.clinicalNoteRepository.create({
      internmentId,
      visitId:        dto.visitId,
      professionalId,
      specialty:      dto.specialty,
      datetime:       new Date(dto.datetime),
      content:        dto.content,
      contentHash,
      lockedAt:       null,
      signed:         false,
    })

    return ClinicalNoteMapper.toDto(note)
  }
}
