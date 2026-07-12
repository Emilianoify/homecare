import { z } from 'zod'
import { BiologicalSex, VATCondition } from '../../../generated/prisma/enums.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

const V = ERROR_MESSAGES.PATIENT.VALIDATION_ERROR

export const createPatientSchema = z.object({
  branchId:               z.uuid({ error: V }),
  lastName:               z.string().min(2, { error: V }).max(100, { error: V }),
  firstName:              z.string().min(2, { error: V }).max(100, { error: V }),
  dni:                    z.string().regex(/^\d{7,8}$/, { error: V }),
  affiliateNumber:        z.string().max(50, { error: V }).optional(),
  dateOfBirth:            z.iso.date({ error: V }),
  biologicalSex:          z.enum(BiologicalSex, { error: V }),
  selfPerceivedGender:    z.string().max(50, { error: V }).optional(),
  vatCondition:           z.enum(VATCondition, { error: V }),
  cuit:                   z.string().max(13, { error: V }).optional(),
  careAddress:            z.string().min(5, { error: V }).max(200, { error: V }),
  careCity:               z.string().min(2, { error: V }).max(100, { error: V }),
  careProvince:           z.string().min(2, { error: V }).max(100, { error: V }),
  carePostalCode:         z.string().max(20, { error: V }).optional(),
  accessNotes:            z.string().max(1000, { error: V }).optional(),
  phone:                  z.string().min(8, { error: V }).max(30, { error: V }),
  email:                  z.email({ error: V }).max(254, { error: V }).optional(),
  bloodType:              z.string().max(10, { error: V }).optional(),
  rhFactor:               z.string().max(10, { error: V }).optional(),
  allergies:              z.string().max(2000, { error: V }).optional(),
  referringDoctorName:    z.string().max(120, { error: V }).optional(),
  referringDoctorLicense: z.string().max(50, { error: V }).optional(),
  referringDoctorPhone:   z.string().max(30, { error: V }).optional(),
  notes:                  z.string().max(2000, { error: V }).optional(),
})

export const updatePatientSchema = createPatientSchema.partial()

export const patientParamsSchema = z.object({
  id: z.uuid({ error: ERROR_MESSAGES.GENERAL.VALIDATION_ERROR }),
})

export const patientQuerySchema = z.object({
  page:     z.coerce.number().int().positive().default(1),
  limit:    z.coerce.number().int().min(1).max(100).default(20),
  search:   z.string().max(100, { error: ERROR_MESSAGES.GENERAL.VALIDATION_ERROR }).optional(),
  branchId: z.uuid({ error: ERROR_MESSAGES.GENERAL.VALIDATION_ERROR }).optional(),
})

export type CreatePatientDto = z.infer<typeof createPatientSchema>
export type UpdatePatientDto = z.infer<typeof updatePatientSchema>
export type PatientQuery     = z.infer<typeof patientQuerySchema>
