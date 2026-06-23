import { z } from 'zod'

export const createPatientContactSchema = z.object({
  name:               z.string().min(2).max(100),
  relationship:       z.string().min(2).max(50),
  phone:              z.string().min(8),
  phoneAlternative:   z.string().optional(),
  email:              z.email().optional(),
  livesAtCareAddress: z.boolean().default(false),
  availabilityHours:  z.string().optional(),
  isPrimary:          z.boolean().default(false),
})

export const updatePatientContactSchema = createPatientContactSchema.partial()

export const patientContactParamsSchema = z.object({
  patientId:  z.string().uuid('UUID inválido'),
  contactId:  z.string().uuid('UUID inválido'),
})

export const patientParamsSchema = z.object({
  patientId: z.string().uuid('UUID inválido'),
})

export type CreatePatientContactDto = z.infer<typeof createPatientContactSchema>
export type UpdatePatientContactDto = z.infer<typeof updatePatientContactSchema>
