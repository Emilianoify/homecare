import type { IClinicalNoteRepository } from '../../../domain/repositories/iClinicalNoteRepository.js'
import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { ClinicalNoteMapper } from '../../../interfaces/http/mappers/clinicalNoteMapper.js'
import type { ClinicalNoteResponseDto } from '../../../interfaces/http/dtos/clinicalNoteDto.js'

export class ListClinicalNotesUseCase {
  constructor(
    private readonly clinicalNoteRepository: IClinicalNoteRepository,
    private readonly internmentRepository:   IInternmentRepository
  ) {}

  async execute(internmentId: string): Promise<ClinicalNoteResponseDto[]> {
    const internment = await this.internmentRepository.findById(internmentId)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    const notes = await this.clinicalNoteRepository.findAllByInternment(internmentId)
    return notes.map(ClinicalNoteMapper.toDto)
  }
}
