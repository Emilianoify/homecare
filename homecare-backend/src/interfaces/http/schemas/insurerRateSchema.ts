import { z } from 'zod'

export const createInsurerRateSchema = z.object({
  serviceItemId: z.uuid(),
  agreedPrice:   z.number().positive(),
  validFrom:     z.iso.date(),
  validTo:       z.iso.date().optional(),
  active:        z.boolean().default(true),
})

export const updateInsurerRateSchema = z.object({
  agreedPrice: z.number().positive().optional(),
  validTo:     z.iso.date().optional().nullable(),
  active:      z.boolean().optional(),
})

export const insurerRateParamsSchema = z.object({
  healthInsurerId: z.uuid(),
  rateId:          z.uuid(),
})

export const insurerParamsSchema = z.object({
  healthInsurerId: z.uuid(),
})

export const insurerRateQuerySchema = z.object({
  onlyActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
})

export type CreateInsurerRateDto = z.infer<typeof createInsurerRateSchema>
export type UpdateInsurerRateDto = z.infer<typeof updateInsurerRateSchema>
export type InsurerRateQuery     = z.infer<typeof insurerRateQuerySchema>
