import { z } from 'zod'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

const V  = ERROR_MESSAGES.MEDICATION.VALIDATION_ERROR
const GV = ERROR_MESSAGES.GENERAL.VALIDATION_ERROR

export const createMedicationSchema = z.object({
  name:      z.string().min(2,  { error: V }).max(150, { error: V }),
  dose:      z.string().min(1,  { error: V }).max(50,  { error: V }),
  route:     z.string().min(2,  { error: V }).max(50,  { error: V }),
  frequency: z.string().min(2,  { error: V }).max(100, { error: V }),
  startDate: z.iso.date({ error: V }),
  endDate:   z.iso.date({ error: V }).optional(),
})

export const updateMedicationSchema = z.object({
  name:      z.string().min(2, { error: V }).max(150, { error: V }).optional(),
  dose:      z.string().min(1, { error: V }).max(50,  { error: V }).optional(),
  route:     z.string().min(2, { error: V }).max(50,  { error: V }).optional(),
  frequency: z.string().min(2, { error: V }).max(100, { error: V }).optional(),
  endDate:   z.iso.date({ error: V }).optional().nullable(),
})

export const discontinueMedicationSchema = z.object({
  endDate: z.iso.date({ error: V }),
})

export const medicationParamsSchema = z.object({
  internmentId:  z.uuid({ error: GV }),
  medicationId:  z.uuid({ error: GV }),
})

export const internmentParamsSchema = z.object({
  internmentId: z.uuid({ error: GV }),
})

export const medicationQuerySchema = z.object({
  active: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
})

export type CreateMedicationDto      = z.infer<typeof createMedicationSchema>
export type UpdateMedicationDto      = z.infer<typeof updateMedicationSchema>
export type DiscontinueMedicationDto = z.infer<typeof discontinueMedicationSchema>
export type MedicationQuery          = z.infer<typeof medicationQuerySchema>
