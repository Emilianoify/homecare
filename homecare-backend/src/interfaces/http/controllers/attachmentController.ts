import type { Request, Response } from 'express'
import { AttachmentRepository } from '../../../infrastructure/database/repositories/attachmentRepository.js'
import { InternmentRepository } from '../../../infrastructure/database/repositories/internmentRepository.js'
import { CreateAttachmentUseCase } from '../../../application/useCases/attachment/createAttachmentUseCase.js'
import { ListAttachmentsUseCase } from '../../../application/useCases/attachment/listAttachmentsUseCase.js'
import { GetAttachmentUseCase } from '../../../application/useCases/attachment/getAttachmentUseCase.js'
import { sendOk, sendCreated } from '../../../shared/helpers/responseHelper.js'
import { SUCCESS_MESSAGES } from '../../../shared/constants/messages.js'
import type { CreateAttachmentDto, AttachmentQuery } from '../schemas/attachmentSchema.js'

export class AttachmentController {
  private readonly attachmentRepo = new AttachmentRepository()
  private readonly internmentRepo = new InternmentRepository()

  list = async (req: Request, res: Response): Promise<void> => {
    const query  = req.query as unknown as AttachmentQuery
    const result = await new ListAttachmentsUseCase(this.attachmentRepo, this.internmentRepo)
      .execute(req.params['internmentId'] as string, query)
    sendOk(res, SUCCESS_MESSAGES.ATTACHMENT.LIST, result)
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    const result = await new GetAttachmentUseCase(this.attachmentRepo)
      .execute(req.params['attachmentId'] as string, req.params['internmentId'] as string)
    sendOk(res, SUCCESS_MESSAGES.ATTACHMENT.FOUND, result)
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const result = await new CreateAttachmentUseCase(this.attachmentRepo, this.internmentRepo)
      .execute(
        req.params['internmentId'] as string,
        req.body as CreateAttachmentDto,
        req.user!.userId
      )
    sendCreated(res, SUCCESS_MESSAGES.ATTACHMENT.CREATED, result)
  }
}
