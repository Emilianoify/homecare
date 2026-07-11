import { z } from 'zod'
import { BiologicalSex, VATCondition } from '../../../generated/prisma/enums.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

const V = ERROR_MESSAGES.PATIENT.VALIDATION_ERROR

export const createPatientSchema = z.object({
  branchId:               z.uuid({ error: V }),
  lastName:               z.string().min(2, { error: V }).max(100, { error: V }),
  firstName:              z.string().min(2, { error: V }).max(100, { error: V }),
  dni:                    z.string().regex(/^\d{7,8}$/, { error: V }),
  affiliateNumber:        z.string().optional(),
  dateOfBirth:            z.iso.date({ error: V }),
  biologicalSex:          z.enum(BiologicalSex, { error: V }),
  selfPerceivedGender:    z.string().optional(),
  vatCondition:           z.enum(VATCondition, { error: V }),
  cuit:                   z.string().optional(),
  careAddress:            z.string().min(5, { error: V }),
  careCity:               z.string().min(2, { error: V }),
  careProvince:           z.string().min(2, { error: V }),
  carePostalCode:         z.string().optional(),
  accessNotes:            z.string().optional(),
  phone:                  z.string().min(8, { error: V }),
  email:                  z.email({ error: V }).optional(),
  bloodType:              z.string().optional(),
  rhFactor:               z.string().optional(),
  allergies:              z.string().optional(),
  referringDoctorName:    z.string().optional(),
  referringDoctorLicense: z.string().optional(),
  referringDoctorPhone:   z.string().optional(),
  notes:                  z.string().optional(),
})

export const updatePatientSchema = createPatientSchema.partial()

export const patientParamsSchema = z.object({
  id: z.uuid({ error: ERROR_MESSAGES.GENERAL.VALIDATION_ERROR }),
})

export const patientQuerySchema = z.object({
  page:     z.coerce.number().int().positive().default(1),
  limit:    z.coerce.number().int().min(1).max(100).default(20),
  search:   z.string().optional(),
  branchId: z.uuid({ error: ERROR_MESSAGES.GENERAL.VALIDATION_ERROR }).optional(),
})

export type CreatePatientDto = z.infer<typeof createPatientSchema>
export type UpdatePatientDto = z.infer<typeof updatePatientSchema>
export type PatientQuery     = z.infer<typeof patientQuerySchema>
