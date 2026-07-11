import { z } from 'zod'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

const V  = ERROR_MESSAGES.PATIENT_CONTACT.VALIDATION_ERROR
const GV = ERROR_MESSAGES.GENERAL.VALIDATION_ERROR

export const createPatientContactSchema = z.object({
  name:               z.string().min(2, { error: V }).max(100, { error: V }),
  relationship:       z.string().min(2, { error: V }).max(50,  { error: V }),
  phone:              z.string().min(8, { error: V }),
  phoneAlternative:   z.string().optional(),
  email:              z.email({ error: V }).optional(),
  livesAtCareAddress: z.boolean().default(false),
  availabilityHours:  z.string().optional(),
  isPrimary:          z.boolean().default(false),
})

export const updatePatientContactSchema = createPatientContactSchema.partial()

export const patientContactParamsSchema = z.object({
  patientId: z.uuid({ error: GV }),
  contactId: z.uuid({ error: GV }),
})

export const patientParamsSchema = z.object({
  patientId: z.uuid({ error: GV }),
})

export type CreatePatientContactDto = z.infer<typeof createPatientContactSchema>
export type UpdatePatientContactDto = z.infer<typeof updatePatientContactSchema>
