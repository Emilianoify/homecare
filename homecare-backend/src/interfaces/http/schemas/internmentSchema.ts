import { z } from 'zod'
import { InternmentType, AdmissionMode, InternmentStatus } from '../../../generated/prisma/enums.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

const V  = ERROR_MESSAGES.INTERNMENT.VALIDATION_ERROR
const GV = ERROR_MESSAGES.GENERAL.VALIDATION_ERROR

export const createInternmentSchema = z.object({
  patientId:                  z.uuid({ error: V }),
  branchId:                   z.uuid({ error: V }),
  healthInsurerId:            z.uuid({ error: V }),
  responsibleDoctorId:        z.uuid({ error: V }),
  internmentType:             z.enum(InternmentType,  { error: V }),
  admissionMode:              z.enum(AdmissionMode,   { error: V }),
  admissionDate:              z.iso.date({ error: V }),
  mainDiagnosis:              z.string().min(3, { error: V }).max(500, { error: V }),
  cie10Code:                  z.string().min(3, { error: V }).max(10, { error: V }),
  referenceHospital:          z.string().max(500).optional(),
  omeRequestedBy:             z.string().max(500).optional(),
  omeDate:                    z.iso.date({ error: V }).optional(),
  medicalFamilyAgreement:     z.boolean().default(false),
  medicalFamilyAgreementDate: z.iso.date({ error: V }).optional(),
  notes:                      z.string().max(500).optional(),
})

export const updateInternmentSchema = createInternmentSchema.partial()

export const dischargeInternmentSchema = z.object({
  dischargeDate:   z.iso.date({ error: V }),
  dischargeReason: z.string().min(3, { error: V }).max(500, { error: V }),
})

export const internmentParamsSchema = z.object({
  id: z.uuid({ error: GV }),
})

export const internmentQuerySchema = z.object({
  page:            z.coerce.number().int().positive().default(1),
  limit:           z.coerce.number().int().min(1).max(100).default(20),
  status:          z.enum([...Object.values(InternmentStatus), 'all'] as unknown as [string, ...string[]]).default('all'),
  patientId:       z.uuid({ error: GV }).optional(),
  healthInsurerId: z.uuid({ error: GV }).optional(),
  branchId:        z.uuid({ error: GV }).optional(),
})

export type CreateInternmentDto    = z.infer<typeof createInternmentSchema>
export type UpdateInternmentDto    = z.infer<typeof updateInternmentSchema>
export type DischargeInternmentDto = z.infer<typeof dischargeInternmentSchema>
export type InternmentQuery        = z.infer<typeof internmentQuerySchema>
