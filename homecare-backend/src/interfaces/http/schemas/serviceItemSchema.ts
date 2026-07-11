import { z } from 'zod'
import { Specialty, BillingMode } from '../../../generated/prisma/enums.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

const V  = ERROR_MESSAGES.SERVICE_ITEM.VALIDATION_ERROR
const GV = ERROR_MESSAGES.GENERAL.VALIDATION_ERROR

export const createServiceItemSchema = z.object({
  specialty:   z.enum(Specialty,   { error: V }),
  code:        z.string().min(2, { error: V }).max(20,  { error: V }),
  description: z.string().min(3, { error: V }).max(200, { error: V }),
  billingMode: z.enum(BillingMode, { error: V }),
  basePrice:   z.number().positive({ error: V }),
  active:      z.boolean().default(true),
})

export const updateServiceItemSchema = createServiceItemSchema.partial()

export const serviceItemParamsSchema = z.object({
  id: z.uuid({ error: GV }),
})

export const serviceItemQuerySchema = z.object({
  page:      z.coerce.number().int().positive().default(1),
  limit:     z.coerce.number().int().min(1).max(100).default(20),
  search:    z.string().optional(),
  specialty: z.string().optional(),
  active:    z.enum(['true', 'false']).transform(v => v === 'true').optional(),
})

export type CreateServiceItemDto = z.infer<typeof createServiceItemSchema>
export type UpdateServiceItemDto = z.infer<typeof updateServiceItemSchema>
export type ServiceItemQuery     = z.infer<typeof serviceItemQuerySchema>
