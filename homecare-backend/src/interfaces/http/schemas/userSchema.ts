import { z } from 'zod'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

const V  = ERROR_MESSAGES.USER.VALIDATION_ERROR
const GV = ERROR_MESSAGES.GENERAL.VALIDATION_ERROR

export const createUserSchema = z.object({
  email:     z.email({ error: V }),
  password:  z.string()
               .min(8,  { error: V })
               .regex(/[A-Z]/, { error: V })
               .regex(/[0-9]/, { error: V }),
  firstName: z.string().min(2, { error: V }).max(100, { error: V }),
  lastName:  z.string().min(2, { error: V }).max(100, { error: V }),
  roleId:    z.uuid({ error: V }),
  branchId:  z.uuid({ error: V }).optional(),
  active:    z.boolean().default(true),
})

export const updateUserSchema = z.object({
  firstName: z.string().min(2, { error: V }).max(100, { error: V }).optional(),
  lastName:  z.string().min(2, { error: V }).max(100, { error: V }).optional(),
  roleId:    z.uuid({ error: V }).optional(),
  branchId:  z.uuid({ error: V }).optional().nullable(),
  active:    z.boolean().optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6,  { error: V }),
  newPassword:     z.string()
                    .min(8,  { error: V })
                    .regex(/[A-Z]/, { error: V })
                    .regex(/[0-9]/, { error: V }),
})

export const userParamsSchema = z.object({
  id: z.uuid({ error: GV }),
})

export const userQuerySchema = z.object({
  page:   z.coerce.number().int().positive().default(1),
  limit:  z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  roleId: z.uuid({ error: GV }).optional(),
  active: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
})

export type CreateUserDto     = z.infer<typeof createUserSchema>
export type UpdateUserDto     = z.infer<typeof updateUserSchema>
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>
export type UserQuery         = z.infer<typeof userQuerySchema>
