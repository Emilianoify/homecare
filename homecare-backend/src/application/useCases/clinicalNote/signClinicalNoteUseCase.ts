import type { IClinicalNoteRepository } from '../../../domain/repositories/iClinicalNoteRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { ClinicalNoteMapper } from '../../../interfaces/http/mappers/clinicalNoteMapper.js'
import type { ClinicalNoteResponseDto } from '../../../interfaces/http/dtos/clinicalNoteDto.js'

export class SignClinicalNoteUseCase {
  constructor(private readonly clinicalNoteRepository: IClinicalNoteRepository) {}

  async execute(id: string, internmentId: string): Promise<ClinicalNoteResponseDto> {
    const note = await this.clinicalNoteRepository.findById(id, internmentId)
    if (!note) throw new AppError(404, ERROR_MESSAGES.CLINICAL_NOTE.NOT_FOUND)

    if (note.signed) throw new AppError(409, ERROR_MESSAGES.CLINICAL_NOTE.ALREADY_SIGNED)

    const signed = await this.clinicalNoteRepository.sign(id)
    return ClinicalNoteMapper.toDto(signed)
  }
}
