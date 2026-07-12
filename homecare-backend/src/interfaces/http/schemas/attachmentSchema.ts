import { z } from 'zod'
import { AttachmentType } from '../../../generated/prisma/enums.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

const V  = ERROR_MESSAGES.ATTACHMENT.VALIDATION_ERROR
const GV = ERROR_MESSAGES.GENERAL.VALIDATION_ERROR

export const createAttachmentSchema = z.object({
  clinicalNoteId: z.uuid({ error: V }).optional(),
  type:           z.enum(AttachmentType, { error: V }),
  fileName:       z.string().min(1, { error: V }).max(255, { error: V }),
  storageUrl:     z.url({ error: V }).max(2048, { error: V }),
  mimeType:       z.string().min(1, { error: V }).max(100, { error: V }),
  sizeBytes:      z.number().int().positive({ error: V }).max(2_147_483_647, { error: V }),
})

export const attachmentParamsSchema = z.object({
  internmentId:  z.uuid({ error: GV }),
  attachmentId:  z.uuid({ error: GV }),
})

export const internmentParamsSchema = z.object({
  internmentId: z.uuid({ error: GV }),
})

export const attachmentQuerySchema = z.object({
  clinicalNoteId: z.uuid({ error: GV }).optional(),
  type:           z.string().max(30, { error: GV }).optional(),
})

export type CreateAttachmentDto = z.infer<typeof createAttachmentSchema>
export type AttachmentQuery     = z.infer<typeof attachmentQuerySchema>
