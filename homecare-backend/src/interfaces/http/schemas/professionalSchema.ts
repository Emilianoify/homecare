import { z } from 'zod'
import { Specialty, VATCondition, ContractType } from '../../../generated/prisma/enums.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

const V  = ERROR_MESSAGES.PROFESSIONAL.VALIDATION_ERROR
const GV = ERROR_MESSAGES.GENERAL.VALIDATION_ERROR

export const createProfessionalSchema = z.object({
  lastName:              z.string().min(2, { error: V }).max(100, { error: V }),
  firstName:             z.string().min(2, { error: V }).max(100, { error: V }),
  dni:                   z.string().regex(/^\d{7,8}$/, { error: V }),
  cuit:                  z.string().regex(/^\d{2}-\d{8}-\d{1}$/, { error: V }),
  vatCondition:          z.enum(VATCondition,  { error: V }),
  specialty:             z.enum(Specialty,     { error: V }),
  secondarySpecialties:  z.array(z.enum(Specialty, { error: V })).optional(),
  nationalLicense:       z.string().max(500).optional(),
  provincialLicense:     z.string().max(500).optional(),
  licenseProvince:       z.string().max(500).optional(),
  licenseExpiresAt:      z.iso.date({ error: V }).optional(),
  rnp:                   z.string().max(500).optional(),
  contractType:          z.enum(ContractType, { error: V }),
  cbu:                   z.string().length(22, { error: V }),
  bankAlias:             z.string().max(500).optional(),
  bank:                  z.string().max(500).optional(),
  coverageZones:         z.array(z.string().max(100)).max(50).optional(),
  availableForEmergency: z.boolean().default(false),
  hasOwnVehicle:         z.boolean().default(false),
  phone:                 z.string().min(8, { error: V }).max(30, { error: V }),
  email:                 z.email({ error: V }).optional(),
})

export const updateProfessionalSchema = createProfessionalSchema.partial()

export const professionalParamsSchema = z.object({
  id: z.uuid({ error: GV }),
})

export const professionalQuerySchema = z.object({
  page:      z.coerce.number().int().positive().default(1),
  limit:     z.coerce.number().int().min(1).max(100).default(20),
  search:    z.string().max(100).optional(),
  specialty: z.string().max(500).optional(),
  active:    z.enum(['true', 'false']).transform(v => v === 'true').optional(),
})

export type CreateProfessionalDto = z.infer<typeof createProfessionalSchema>
export type UpdateProfessionalDto = z.infer<typeof updateProfessionalSchema>
export type ProfessionalQuery     = z.infer<typeof professionalQuerySchema>
