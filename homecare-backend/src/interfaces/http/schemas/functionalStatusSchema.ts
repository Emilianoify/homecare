import { z } from 'zod'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

const V  = ERROR_MESSAGES.FUNCTIONAL_STATUS.VALIDATION_ERROR
const GV = ERROR_MESSAGES.GENERAL.VALIDATION_ERROR

export const createFunctionalStatusSchema = z.object({
  internmentId:           z.uuid({ error: V }),
  date:                   z.iso.date({ error: V }),
  bedridden:              z.boolean().default(false),
  wheelchair:             z.boolean().default(false),
  oxygenDependent:        z.boolean().default(false),
  oxygenLitersPerMin:     z.number().positive({ error: V }).optional(),
  tracheostomy:           z.boolean().default(false),
  pumpFeeding:            z.boolean().default(false),
  nasogastricTube:        z.boolean().default(false),
  urinaryCatheter:        z.boolean().default(false),
  pressureUlcers:         z.boolean().default(false),
  pressureUlcersLocation: z.string().optional(),
  barthelScore:           z.record(z.string(), z.unknown()).optional(),
  notes:                  z.string().optional(),
})

export const functionalStatusParamsSchema = z.object({
  patientId: z.uuid({ error: GV }),
})

export const functionalStatusQuerySchema = z.object({
  internmentId: z.uuid({ error: GV }).optional(),
})

export type CreateFunctionalStatusDto = z.infer<typeof createFunctionalStatusSchema>
