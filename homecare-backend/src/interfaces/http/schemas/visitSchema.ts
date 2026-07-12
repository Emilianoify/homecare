import { z } from 'zod'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

const V  = ERROR_MESSAGES.VISIT.VALIDATION_ERROR
const GV = ERROR_MESSAGES.GENERAL.VALIDATION_ERROR

export const createVisitSchema = z.object({
  carePlanId:   z.uuid({ error: V }),
  professionalId: z.uuid({ error: V }),
  completedAt:  z.iso.datetime({ error: V }),
  lat:          z.number().min(-90).max(90).optional(),
  lng:          z.number().min(-180).max(180).optional(),
  notes:        z.string().max(2000, { error: V }).optional(),
})

export const markMissedSchema = z.object({
  missedReason: z.string().min(3, { error: V }).max(500, { error: V }),
})

export const visitParamsSchema = z.object({
  internmentId: z.uuid({ error: GV }),
  visitId:      z.uuid({ error: GV }),
})

export const internmentParamsSchema = z.object({
  internmentId: z.uuid({ error: GV }),
})

export const visitQuerySchema = z.object({
  page:           z.coerce.number().int().positive().default(1),
  limit:          z.coerce.number().int().min(1).max(100).default(20),
  professionalId: z.uuid({ error: GV }).optional(),
  status:         z.string().max(20, { error: GV }).optional(),
  dateFrom:       z.iso.date({ error: GV }).optional(),
  dateTo:         z.iso.date({ error: GV }).optional(),
})

export type CreateVisitDto  = z.infer<typeof createVisitSchema>
export type MarkMissedDto   = z.infer<typeof markMissedSchema>
export type VisitQuery      = z.infer<typeof visitQuerySchema>
