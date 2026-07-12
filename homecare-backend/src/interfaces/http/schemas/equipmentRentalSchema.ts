import { z } from 'zod'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

const V  = ERROR_MESSAGES.EQUIPMENT_RENTAL.VALIDATION_ERROR
const GV = ERROR_MESSAGES.GENERAL.VALIDATION_ERROR

export const createEquipmentRentalSchema = z.object({
  equipmentId:     z.uuid({ error: V }),
  authorizationId: z.uuid({ error: V }).optional(),
  budgetId:        z.uuid({ error: V }).optional(),
  monthlyRate:     z.number().positive({ error: V }),
  startDate:       z.iso.date({ error: V }),
})

export const closeEquipmentRentalSchema = z.object({
  endDate:      z.iso.date({ error: V }),
  closedReason: z.string().min(3, { error: V }).max(500, { error: V }),
})

export const equipmentRentalParamsSchema = z.object({
  internmentId: z.uuid({ error: GV }),
  rentalId:     z.uuid({ error: GV }),
})

export const internmentParamsSchema = z.object({
  internmentId: z.uuid({ error: GV }),
})

export const equipmentRentalQuerySchema = z.object({
  onlyActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
})

export type CreateEquipmentRentalDto = z.infer<typeof createEquipmentRentalSchema>
export type CloseEquipmentRentalDto  = z.infer<typeof closeEquipmentRentalSchema>
export type EquipmentRentalQuery     = z.infer<typeof equipmentRentalQuerySchema>
