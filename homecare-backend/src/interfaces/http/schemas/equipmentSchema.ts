import { z } from 'zod'
import { EquipmentStatus } from '../../../generated/prisma/enums.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

const V  = ERROR_MESSAGES.EQUIPMENT.VALIDATION_ERROR
const GV = ERROR_MESSAGES.GENERAL.VALIDATION_ERROR

export const createEquipmentSchema = z.object({
  branchId:     z.uuid({ error: V }),
  provider:     z.string().min(2, { error: V }).max(150, { error: V }),
  name:         z.string().min(2, { error: V }).max(150, { error: V }),
  serialNumber: z.string().max(100, { error: V }).optional(),
  model:        z.string().max(100, { error: V }).optional(),
  dailyRate:    z.number().positive({ error: V }),
  notes:        z.string().max(1000, { error: V }).optional(),
})

export const updateEquipmentSchema = z.object({
  branchId:     z.uuid({ error: V }).optional(),
  provider:     z.string().min(2, { error: V }).max(150, { error: V }).optional(),
  name:         z.string().min(2, { error: V }).max(150, { error: V }).optional(),
  serialNumber: z.string().max(100, { error: V }).optional().nullable(),
  model:        z.string().max(100, { error: V }).optional().nullable(),
  dailyRate:    z.number().positive({ error: V }).optional(),
  notes:        z.string().max(1000, { error: V }).optional().nullable(),
})

export const equipmentParamsSchema = z.object({
  id: z.uuid({ error: GV }),
})

export const equipmentQuerySchema = z.object({
  page:     z.coerce.number().int().positive().default(1),
  limit:    z.coerce.number().int().min(1).max(100).default(20),
  branchId: z.uuid({ error: GV }).optional(),
  status:   z.enum(EquipmentStatus).optional(),
  search:   z.string().max(100, { error: GV }).optional(),
})

export type CreateEquipmentDto = z.infer<typeof createEquipmentSchema>
export type UpdateEquipmentDto = z.infer<typeof updateEquipmentSchema>
export type EquipmentQuery     = z.infer<typeof equipmentQuerySchema>
