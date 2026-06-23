import { z } from 'zod'

const uuidSchema = z.string().uuid('UUID inválido')

export const createPatientSchema = z.object({
  branchId:               uuidSchema,
  lastName:               z.string().min(2).max(100),
  firstName:              z.string().min(2).max(100),
  dni:                    z.string().regex(/^\d{7,8}$/, 'DNI inválido'),
  affiliateNumber:        z.string().optional(),
  dateOfBirth:            z.iso.date(),
  biologicalSex:          z.enum(['MALE', 'FEMALE', 'INTERSEX']),
  selfPerceivedGender:    z.string().optional(),
  vatCondition:           z.enum(['REGISTERED_TAXPAYER', 'MONOTAX', 'EXEMPT', 'NOT_REGISTERED', 'FINAL_CONSUMER']),
  cuit:                   z.string().optional(),
  careAddress:            z.string().min(5),
  careCity:               z.string().min(2),
  careProvince:           z.string().min(2),
  carePostalCode:         z.string().optional(),
  accessNotes:            z.string().optional(),
  phone:                  z.string().min(8),
  email:                  z.email().optional(),
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
  id: uuidSchema,
})

export const patientQuerySchema = z.object({
  page:     z.string().transform(Number).pipe(z.number().int().positive()).default(1),
  limit:    z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default(20),
  search:   z.string().optional(),
  branchId: uuidSchema.optional(),
})

export type CreatePatientDto = z.infer<typeof createPatientSchema>
export type UpdatePatientDto = z.infer<typeof updatePatientSchema>
export type PatientQuery     = z.infer<typeof patientQuerySchema>
