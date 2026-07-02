import { z } from 'zod'

export const createBranchSchema = z.object({
  name:    z.string().min(2).max(100),
  address: z.string().min(5),
  city:    z.string().optional(),
  phone:   z.string().optional(),
  active:  z.boolean().default(true),
})

export const updateBranchSchema = createBranchSchema.partial()

export const branchParamsSchema = z.object({
  id: z.uuid(),
})

export type CreateBranchDto = z.infer<typeof createBranchSchema>
export type UpdateBranchDto = z.infer<typeof updateBranchSchema>
