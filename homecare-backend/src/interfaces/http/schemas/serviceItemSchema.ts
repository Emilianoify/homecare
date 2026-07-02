import { z } from 'zod'

export const createServiceItemSchema = z.object({
  specialty:   z.enum([
    'NURSING',
    'PHYSIOTHERAPY',
    'MEDICINE',
    'NUTRITION',
    'OCCUPATIONAL_THERAPY',
    'SPEECH_THERAPY',
    'PSYCHOLOGY',
    'SOCIAL_WORK',
    'CAREGIVER',
  ]),
  code:        z.string().min(2).max(20),
  description: z.string().min(3).max(200),
  billingMode: z.enum(['PER_VISIT', 'DAILY_MODULE', 'MIXED']),
  basePrice:   z.number().positive(),
  active:      z.boolean().default(true),
})

export const updateServiceItemSchema = createServiceItemSchema.partial()

export const serviceItemParamsSchema = z.object({
  id: z.uuid(),
})

export const serviceItemQuerySchema = z.object({
  page:      z.string().transform(Number).pipe(z.number().int().positive()).default(1),
  limit:     z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default(20),
  search:    z.string().optional(),
  specialty: z.string().optional(),
  active:    z.enum(['true', 'false']).transform(v => v === 'true').optional(),
})

export type CreateServiceItemDto = z.infer<typeof createServiceItemSchema>
export type UpdateServiceItemDto = z.infer<typeof updateServiceItemSchema>
export type ServiceItemQuery     = z.infer<typeof serviceItemQuerySchema>
