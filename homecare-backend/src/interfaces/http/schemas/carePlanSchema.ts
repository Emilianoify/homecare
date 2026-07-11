import { z } from 'zod'
import { Specialty, Frequency } from '../../../generated/prisma/enums.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

const V  = ERROR_MESSAGES.CARE_PLAN.VALIDATION_ERROR
const GV = ERROR_MESSAGES.GENERAL.VALIDATION_ERROR

export const createCarePlanSchema = z.object({
  professionalId:  z.uuid({ error: V }),
  authorizationId: z.uuid({ error: V }).optional(),
  specialty:       z.enum(Specialty,  { error: V }),
  frequency:       z.enum(Frequency,  { error: V }),
  weekDays:        z.array(
                     z.number().int().min(0).max(6, { error: V })
                   ).optional(),
  estimatedTime:   z.string().optional(),
  totalSessions:   z.number().int().positive({ error: V }).optional(),
  startDate:       z.iso.date({ error: V }),
  endDate:         z.iso.date({ error: V }).optional(),
})

export const carePlanParamsSchema = z.object({
  internmentId: z.uuid({ error: GV }),
  carePlanId:   z.uuid({ error: GV }),
})

export const internmentParamsSchema = z.object({
  internmentId: z.uuid({ error: GV }),
})

export const carePlanQuerySchema = z.object({
  active: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
})

export type CreateCarePlanDto = z.infer<typeof createCarePlanSchema>
export type CarePlanQuery     = z.infer<typeof carePlanQuerySchema>
