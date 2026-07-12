import type { IAttachmentRepository } from '../../../domain/repositories/iAttachmentRepository.js'
import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { AttachmentMapper } from '../../../interfaces/http/mappers/attachmentMapper.js'
import type { CreateAttachmentDto } from '../../../interfaces/http/schemas/attachmentSchema.js'
import type { AttachmentResponseDto } from '../../../interfaces/http/dtos/attachmentDto.js'

export class CreateAttachmentUseCase {
  constructor(
    private readonly attachmentRepository: IAttachmentRepository,
    private readonly internmentRepository: IInternmentRepository
  ) {}

  async execute(
    internmentId: string,
    dto:          CreateAttachmentDto,
    uploadedById: string
  ): Promise<AttachmentResponseDto> {
    // Verificar que la internación existe
    const internment = await this.internmentRepository.findById(internmentId)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    // Si se indica nota clínica, verificar que pertenece a la internación
    if (dto.clinicalNoteId) {
      const note = await this.attachmentRepository.findClinicalNoteByIdAndInternment(
        dto.clinicalNoteId,
        internmentId
      )
      if (!note) throw new AppError(404, ERROR_MESSAGES.ATTACHMENT.NOTE_NOT_FOUND)
    }

    const attachment = await this.attachmentRepository.create({
      internmentId,
      clinicalNoteId: dto.clinicalNoteId ?? null,
      uploadedById,
      type:           dto.type,
      fileName:       dto.fileName,
      storageUrl:     dto.storageUrl,
      mimeType:       dto.mimeType,
      sizeBytes:      dto.sizeBytes,
    })

    return AttachmentMapper.toDto(attachment)
  }
}
