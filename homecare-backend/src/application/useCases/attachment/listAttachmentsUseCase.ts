import type { IAttachmentRepository } from '../../../domain/repositories/iAttachmentRepository.js'
import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { AttachmentMapper } from '../../../interfaces/http/mappers/attachmentMapper.js'
import type { AttachmentQuery } from '../../../interfaces/http/schemas/attachmentSchema.js'
import type { AttachmentResponseDto } from '../../../interfaces/http/dtos/attachmentDto.js'

export class ListAttachmentsUseCase {
  constructor(
    private readonly attachmentRepository: IAttachmentRepository,
    private readonly internmentRepository: IInternmentRepository
  ) {}

  async execute(internmentId: string, query: AttachmentQuery): Promise<AttachmentResponseDto[]> {
    const internment = await this.internmentRepository.findById(internmentId)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    const attachments = await this.attachmentRepository.findAll({
      internmentId,
      clinicalNoteId: query.clinicalNoteId,
      type:           query.type,
    })

    return attachments.map((item) => AttachmentMapper.toDto(item))
  }
}
