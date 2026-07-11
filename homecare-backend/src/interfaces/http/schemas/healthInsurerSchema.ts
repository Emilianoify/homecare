import { z } from 'zod'
import { InsurerType, BillingMode } from '../../../generated/prisma/enums.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

const V  = ERROR_MESSAGES.HEALTH_INSURER.VALIDATION_ERROR
const GV = ERROR_MESSAGES.GENERAL.VALIDATION_ERROR

export const createHealthInsurerSchema = z.object({
  name:           z.string().min(2, { error: V }).max(150, { error: V }),
  acronym:        z.string().min(2, { error: V }).max(20,  { error: V }),
  cuit:           z.string().regex(/^\d{2}-\d{8}-\d{1}$/, { error: V }),
  rnos:           z.string().optional(),
  insurerType:    z.enum(InsurerType,  { error: V }),
  billingEmail:   z.email({ error: V }).optional(),
  billingMode:    z.enum(BillingMode,  { error: V }),
  cutoffDay:      z.number().int().min(1).max(31).optional(),
  paymentDays:    z.number().int().positive().optional(),
  requiresPaper:  z.boolean().default(false),
  operativeNotes: z.string().optional(),
  active:         z.boolean().default(true),
})

export const updateHealthInsurerSchema = createHealthInsurerSchema.partial()

export const healthInsurerParamsSchema = z.object({
  id: z.uuid({ error: GV }),
})

export const healthInsurerQuerySchema = z.object({
  page:        z.coerce.number().int().positive().default(1),
  limit:       z.coerce.number().int().min(1).max(100).default(20),
  search:      z.string().optional(),
  insurerType: z.enum(InsurerType).optional(),
  active:      z.enum(['true', 'false']).transform(v => v === 'true').optional(),
})

export type CreateHealthInsurerDto = z.infer<typeof createHealthInsurerSchema>
export type UpdateHealthInsurerDto = z.infer<typeof updateHealthInsurerSchema>
export type HealthInsurerQuery     = z.infer<typeof healthInsurerQuerySchema>
