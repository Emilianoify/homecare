import { z } from 'zod'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

const V  = ERROR_MESSAGES.INSURER_SUPPLY_RATE.VALIDATION_ERROR
const GV = ERROR_MESSAGES.GENERAL.VALIDATION_ERROR

export const createInsurerSupplyRateSchema = z.object({
  supplyId:    z.uuid({ error: V }),
  agreedPrice: z.number().positive({ error: V }),
  validFrom:   z.iso.date({ error: V }),
  validTo:     z.iso.date({ error: V }).optional(),
  active:      z.boolean().default(true),
})

export const updateInsurerSupplyRateSchema = z.object({
  agreedPrice: z.number().positive({ error: V }).optional(),
  validTo:     z.iso.date({ error: V }).optional().nullable(),
  active:      z.boolean().optional(),
})

export const insurerSupplyRateParamsSchema = z.object({
  healthInsurerId: z.uuid({ error: GV }),
  supplyRateId:    z.uuid({ error: GV }),
})

export const insurerParamsSchema = z.object({
  healthInsurerId: z.uuid({ error: GV }),
})

export const insurerSupplyRateQuerySchema = z.object({
  onlyActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
})

export type CreateInsurerSupplyRateDto = z.infer<typeof createInsurerSupplyRateSchema>
export type UpdateInsurerSupplyRateDto = z.infer<typeof updateInsurerSupplyRateSchema>
export type InsurerSupplyRateQuery     = z.infer<typeof insurerSupplyRateQuerySchema>
