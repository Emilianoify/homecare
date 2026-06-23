import { z } from 'zod'

const uuidSchema = z.string().uuid('UUID inválido')

const specialtyEnum = z.enum([
  'NURSING',
  'PHYSIOTHERAPY',
  'MEDICINE',
  'NUTRITION',
  'OCCUPATIONAL_THERAPY',
  'SPEECH_THERAPY',
  'PSYCHOLOGY',
  'SOCIAL_WORK',
  'CAREGIVER',
])

export const createProfessionalSchema = z.object({
  lastName:              z.string().min(2).max(100),
  firstName:             z.string().min(2).max(100),
  dni:                   z.string().regex(/^\d{7,8}$/, 'DNI inválido'),
  cuit:                  z.string().regex(/^\d{2}-\d{8}-\d{1}$/, 'CUIT inválido'),
  vatCondition:          z.enum(['REGISTERED_TAXPAYER', 'MONOTAX', 'EXEMPT', 'NOT_REGISTERED', 'FINAL_CONSUMER']),
  specialty:             specialtyEnum,
  secondarySpecialties:  z.array(specialtyEnum).optional(),
  nationalLicense:       z.string().optional(),
  provincialLicense:     z.string().optional(),
  licenseProvince:       z.string().optional(),
  licenseExpiresAt:      z.iso.date().optional(),
  rnp:                   z.string().optional(),
  contractType:          z.enum(['EMPLOYEE', 'MONOTAX', 'INVOICE']),
  cbu:                   z.string().length(22, 'CBU debe tener 22 dígitos'),
  bankAlias:             z.string().optional(),
  bank:                  z.string().optional(),
  coverageZones:         z.array(z.string()).optional(),
  availableForEmergency: z.boolean().default(false),
  hasOwnVehicle:         z.boolean().default(false),
  phone:                 z.string().min(8),
  email:                 z.email().optional(),
})

export const updateProfessionalSchema = createProfessionalSchema.partial()

export const professionalParamsSchema = z.object({
  id: uuidSchema,
})

export const professionalQuerySchema = z.object({
  page:      z.string().transform(Number).pipe(z.number().int().positive()).default(1),
  limit:     z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default(20),
  search:    z.string().optional(),
  specialty: z.string().optional(),
  active:    z.enum(['true', 'false']).transform(v => v === 'true').optional(),
})

export type CreateProfessionalDto = z.infer<typeof createProfessionalSchema>
export type UpdateProfessionalDto = z.infer<typeof updateProfessionalSchema>
export type ProfessionalQuery     = z.infer<typeof professionalQuerySchema>
