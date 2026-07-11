import { z } from 'zod'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

const V  = ERROR_MESSAGES.BRANCH.VALIDATION_ERROR
const GV = ERROR_MESSAGES.GENERAL.VALIDATION_ERROR

export const createBranchSchema = z.object({
  name:    z.string().min(2, { error: V }).max(100, { error: V }),
  address: z.string().min(5, { error: V }),
  city:    z.string().optional(),
  phone:   z.string().optional(),
  active:  z.boolean().default(true),
})

export const updateBranchSchema = createBranchSchema.partial()

export const branchParamsSchema = z.object({
  id: z.uuid({ error: GV }),
})

export type CreateBranchDto = z.infer<typeof createBranchSchema>
export type UpdateBranchDto = z.infer<typeof updateBranchSchema>
