import { z } from 'zod'
import { DiagnosisType, DiagnosisStatus } from '../../../generated/prisma/enums.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

const V  = ERROR_MESSAGES.DIAGNOSIS.VALIDATION_ERROR
const GV = ERROR_MESSAGES.GENERAL.VALIDATION_ERROR

export const createDiagnosisSchema = z.object({
  cie10Code:        z.string().min(3, { error: V }).max(10, { error: V }),
  cie10Description: z.string().min(3, { error: V }).max(300, { error: V }),
  type:             z.enum(DiagnosisType,   { error: V }),
  status:           z.enum(DiagnosisStatus, { error: V }).default('ACTIVE'),
  dateFrom:         z.iso.date({ error: V }),
  dateTo:           z.iso.date({ error: V }).optional(),
})

export const updateDiagnosisSchema = z.object({
  cie10Code:        z.string().min(3, { error: V }).max(10, { error: V }).optional(),
  cie10Description: z.string().min(3, { error: V }).max(300, { error: V }).optional(),
  status:           z.enum(DiagnosisStatus, { error: V }).optional(),
  dateTo:           z.iso.date({ error: V }).optional().nullable(),
})

export const diagnosisParamsSchema = z.object({
  internmentId: z.uuid({ error: GV }),
  diagnosisId:  z.uuid({ error: GV }),
})

export const internmentParamsSchema = z.object({
  internmentId: z.uuid({ error: GV }),
})

export type CreateDiagnosisDto = z.infer<typeof createDiagnosisSchema>
export type UpdateDiagnosisDto = z.infer<typeof updateDiagnosisSchema>
