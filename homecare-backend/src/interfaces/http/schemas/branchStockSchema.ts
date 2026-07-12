import { z } from 'zod'
import { StockMovementType } from '../../../generated/prisma/enums.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

const V  = ERROR_MESSAGES.STOCK_MOVEMENT.VALIDATION_ERROR
const GV = ERROR_MESSAGES.GENERAL.VALIDATION_ERROR

export const createStockMovementSchema = z.object({
  branchId:  z.uuid({ error: V }),
  supplyId:  z.uuid({ error: V }),
  type:      z.enum(StockMovementType, { error: V }),
  quantity:  z.number().int().refine(v => v !== 0, { error: V }),
  reference: z.string().max(200, { error: V }).optional().nullable(),
  notes:     z.string().max(500, { error: V }).optional().nullable(),
})

export const branchStockQuerySchema = z.object({
  branchId: z.uuid({ error: GV }).optional(),
})

export const stockMovementQuerySchema = z.object({
  page:     z.coerce.number().int().positive().default(1),
  limit:    z.coerce.number().int().min(1).max(100).default(20),
  branchId: z.uuid({ error: GV }).optional(),
  supplyId: z.uuid({ error: GV }).optional(),
})

export type CreateStockMovementDto = z.infer<typeof createStockMovementSchema>
export type BranchStockQuery       = z.infer<typeof branchStockQuerySchema>
export type StockMovementQuery     = z.infer<typeof stockMovementQuerySchema>
