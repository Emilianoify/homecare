import { z } from 'zod'

export const createHealthInsurerSchema = z.object({
  name:           z.string().min(2).max(150),
  acronym:        z.string().min(2).max(20),
  cuit:           z.string().regex(/^\d{2}-\d{8}-\d{1}$/, 'CUIT inválido'),
  rnos:           z.string().optional(),
  insurerType:    z.enum(['NATIONAL_INSURANCE', 'PROVINCIAL_INSURANCE', 'PREPAID', 'PRIVATE']),
  billingEmail:   z.email().optional().nullable(),
  billingMode:    z.enum(['PER_VISIT', 'DAILY_MODULE', 'MIXED']),
  cutoffDay:      z.number().int().min(1).max(31).optional().nullable(),
  paymentDays:    z.number().int().positive().optional().nullable(),
  requiresPaper:  z.boolean().default(false),
  operativeNotes: z.string().optional().nullable(),
  active:         z.boolean().default(true),
})

export const updateHealthInsurerSchema = createHealthInsurerSchema.partial()

export const healthInsurerParamsSchema = z.object({
  id: z.uuid(),
})

export const healthInsurerQuerySchema = z.object({
  page:        z.string().transform(Number).pipe(z.number().int().positive()).default(1),
  limit:       z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default(20),
  search:      z.string().optional(),
  insurerType: z.enum(['NATIONAL_INSURANCE', 'PROVINCIAL_INSURANCE', 'PREPAID', 'PRIVATE']).optional(),
  active:      z.enum(['true', 'false']).transform(v => v === 'true').optional(),
})

export type CreateHealthInsurerDto = z.infer<typeof createHealthInsurerSchema>
export type UpdateHealthInsurerDto = z.infer<typeof updateHealthInsurerSchema>
export type HealthInsurerQuery     = z.infer<typeof healthInsurerQuerySchema>
