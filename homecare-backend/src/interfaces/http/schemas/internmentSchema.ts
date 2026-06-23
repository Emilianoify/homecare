import { z } from 'zod'

const uuidSchema = z.string().uuid('UUID inválido')

export const createInternmentSchema = z.object({
  patientId:                  uuidSchema,
  branchId:                   uuidSchema,
  healthInsurerId:            uuidSchema,
  responsibleDoctorId:        uuidSchema,
  internmentType:             z.enum(['ACUTE', 'SUBACUTE', 'CHRONIC', 'COMPLEX_CHRONIC', 'PALLIATIVE_CARE']),
  admissionMode:              z.enum(['HOSPITAL_DISCHARGE', 'FROM_HOME']),
  admissionDate:              z.iso.date(),
  mainDiagnosis:              z.string().min(3),
  cie10Code:                  z.string().min(3).max(10),
  referenceHospital:          z.string().optional(),
  omeRequestedBy:             z.string().optional(),
  omeDate:                    z.iso.date().optional(),
  medicalFamilyAgreement:     z.boolean().default(false),
  medicalFamilyAgreementDate: z.iso.date().optional(),
  notes:                      z.string().optional(),
})

export const updateInternmentSchema = createInternmentSchema.partial()

export const dischargeInternmentSchema = z.object({
  dischargeDate:   z.iso.date(),
  dischargeReason: z.string().min(3),
})

export const internmentParamsSchema = z.object({
  id: uuidSchema,
})

export const internmentQuerySchema = z.object({
  page:            z.string().transform(Number).pipe(z.number().int().positive()).default(1),
  limit:           z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default(20),
  status:          z.enum(['ACTIVE', 'SUSPENDED', 'DISCHARGED', 'CANCELLED', 'all']).default('all'),
  patientId:       uuidSchema.optional(),
  healthInsurerId: uuidSchema.optional(),
  branchId:        uuidSchema.optional(),
})

export type CreateInternmentDto    = z.infer<typeof createInternmentSchema>
export type UpdateInternmentDto    = z.infer<typeof updateInternmentSchema>
export type DischargeInternmentDto = z.infer<typeof dischargeInternmentSchema>
export type InternmentQuery        = z.infer<typeof internmentQuerySchema>
