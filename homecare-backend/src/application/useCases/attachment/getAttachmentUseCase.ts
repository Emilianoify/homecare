import type { IAttachmentRepository } from '../../../domain/repositories/iAttachmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { AttachmentMapper } from '../../../interfaces/http/mappers/attachmentMapper.js'
import type { AttachmentResponseDto } from '../../../interfaces/http/dtos/attachmentDto.js'

export class GetAttachmentUseCase {
  constructor(private readonly attachmentRepository: IAttachmentRepository) {}

  async execute(id: string, internmentId: string): Promise<AttachmentResponseDto> {
    const attachment = await this.attachmentRepository.findById(id, internmentId)
    if (!attachment) throw new AppError(404, ERROR_MESSAGES.ATTACHMENT.NOT_FOUND)
    return AttachmentMapper.toDto(attachment)
  }
}
