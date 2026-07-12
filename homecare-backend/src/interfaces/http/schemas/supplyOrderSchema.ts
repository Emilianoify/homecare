import { z } from 'zod'
import { SupplyOrderStatus } from '../../../generated/prisma/enums.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

const V  = ERROR_MESSAGES.SUPPLY_ORDER.VALIDATION_ERROR
const VI = ERROR_MESSAGES.SUPPLY_ORDER_ITEM.VALIDATION_ERROR
const GV = ERROR_MESSAGES.GENERAL.VALIDATION_ERROR

export const createSupplyOrderSchema = z.object({
  budgetId: z.uuid({ error: V }).optional(),
  notes:    z.string().max(1000, { error: V }).optional(),
})

export const addSupplyOrderItemSchema = z.object({
  supplyId:    z.uuid({ error: VI }).optional(),
  description: z.string().min(1, { error: VI }).max(300, { error: VI }),
  quantity:    z.number().int().positive({ error: VI }),
  unitPrice:   z.number().positive({ error: VI }),
})

export const cancelSupplyOrderSchema = z.object({
  cancellationReason: z.string().min(3, { error: V }).max(500, { error: V }),
})

export const supplyOrderParamsSchema = z.object({
  internmentId:  z.uuid({ error: GV }),
  supplyOrderId: z.uuid({ error: GV }),
})

export const supplyOrderItemParamsSchema = z.object({
  internmentId:  z.uuid({ error: GV }),
  supplyOrderId: z.uuid({ error: GV }),
  itemId:        z.uuid({ error: GV }),
})

export const internmentParamsSchema = z.object({
  internmentId: z.uuid({ error: GV }),
})

export const supplyOrderQuerySchema = z.object({
  page:   z.coerce.number().int().positive().default(1),
  limit:  z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(SupplyOrderStatus).optional(),
})

export type CreateSupplyOrderDto   = z.infer<typeof createSupplyOrderSchema>
export type AddSupplyOrderItemDto  = z.infer<typeof addSupplyOrderItemSchema>
export type CancelSupplyOrderDto   = z.infer<typeof cancelSupplyOrderSchema>
export type SupplyOrderQuery       = z.infer<typeof supplyOrderQuerySchema>
