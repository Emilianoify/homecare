import { z } from 'zod'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

const V  = ERROR_MESSAGES.SUPPLY.VALIDATION_ERROR
const GV = ERROR_MESSAGES.GENERAL.VALIDATION_ERROR

export const createSupplySchema = z.object({
  code:          z.string().max(50,  { error: V }).optional(),
  name:          z.string().min(2,  { error: V }).max(200, { error: V }),
  unit:          z.string().min(1,  { error: V }).max(50,  { error: V }),
  purchasePrice: z.number().positive({ error: V }),
  active:        z.boolean().default(true),
})

export const updateSupplySchema = z.object({
  code:          z.string().max(50,  { error: V }).optional().nullable(),
  name:          z.string().min(2,  { error: V }).max(200, { error: V }).optional(),
  unit:          z.string().min(1,  { error: V }).max(50,  { error: V }).optional(),
  purchasePrice: z.number().positive({ error: V }).optional(),
  active:        z.boolean().optional(),
})

export const supplyParamsSchema = z.object({
  id: z.uuid({ error: GV }),
})

export const supplyQuerySchema = z.object({
  page:   z.coerce.number().int().positive().default(1),
  limit:  z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(100, { error: GV }).optional(),
  active: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
})

export type CreateSupplyDto = z.infer<typeof createSupplySchema>
export type UpdateSupplyDto = z.infer<typeof updateSupplySchema>
export type SupplyQuery     = z.infer<typeof supplyQuerySchema>
