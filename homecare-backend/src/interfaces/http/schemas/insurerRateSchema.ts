import { z } from 'zod'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

const V  = ERROR_MESSAGES.INSURER_RATE.VALIDATION_ERROR
const GV = ERROR_MESSAGES.GENERAL.VALIDATION_ERROR

export const createInsurerRateSchema = z.object({
  serviceItemId: z.uuid({ error: V }),
  agreedPrice:   z.number().positive({ error: V }),
  validFrom:     z.iso.date({ error: V }),
  validTo:       z.iso.date({ error: V }).optional(),
  active:        z.boolean().default(true),
})

export const updateInsurerRateSchema = z.object({
  agreedPrice: z.number().positive({ error: V }).optional(),
  validTo:     z.iso.date({ error: V }).optional().nullable(),
  active:      z.boolean().optional(),
})

export const insurerRateParamsSchema = z.object({
  healthInsurerId: z.uuid({ error: GV }),
  rateId:          z.uuid({ error: GV }),
})

export const insurerParamsSchema = z.object({
  healthInsurerId: z.uuid({ error: GV }),
})

export const insurerRateQuerySchema = z.object({
  onlyActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
})

export type CreateInsurerRateDto = z.infer<typeof createInsurerRateSchema>
export type UpdateInsurerRateDto = z.infer<typeof updateInsurerRateSchema>
export type InsurerRateQuery     = z.infer<typeof insurerRateQuerySchema>
