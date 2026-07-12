import { z } from 'zod'
import { Specialty } from '../../../generated/prisma/enums.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

const V  = ERROR_MESSAGES.CLINICAL_NOTE.VALIDATION_ERROR
const GV = ERROR_MESSAGES.GENERAL.VALIDATION_ERROR

export const createClinicalNoteSchema = z.object({
  visitId:   z.uuid({ error: V }),
  specialty: z.enum(Specialty, { error: V }),
  datetime:  z.iso.datetime({ error: V }),
  content:   z.string().min(10, { error: V }).max(20000, { error: V }),
})

export const clinicalNoteParamsSchema = z.object({
  internmentId: z.uuid({ error: GV }),
  noteId:       z.uuid({ error: GV }),
})

export const internmentParamsSchema = z.object({
  internmentId: z.uuid({ error: GV }),
})

export type CreateClinicalNoteDto = z.infer<typeof createClinicalNoteSchema>
