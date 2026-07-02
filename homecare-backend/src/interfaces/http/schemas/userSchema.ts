import { z } from 'zod'

export const createUserSchema = z.object({
  email:     z.email(),
  password:  z.string()
               .min(8)
               .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
               .regex(/[0-9]/, 'Debe contener al menos un número'),
  firstName: z.string().min(2).max(100),
  lastName:  z.string().min(2).max(100),
  roleId:    z.uuid(),
  branchId:  z.uuid().optional(),
  active:    z.boolean().default(true),
})

export const updateUserSchema = z.object({
  firstName: z.string().min(2).max(100).optional(),
  lastName:  z.string().min(2).max(100).optional(),
  roleId:    z.uuid().optional(),
  branchId:  z.uuid().optional().nullable(),
  active:    z.boolean().optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword:     z.string()
                    .min(8)
                    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
                    .regex(/[0-9]/, 'Debe contener al menos un número'),
})

export const userParamsSchema = z.object({
  id: z.uuid(),
})

export const userQuerySchema = z.object({
  page:   z.string().transform(Number).pipe(z.number().int().positive()).default(1),
  limit:  z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default(20),
  search: z.string().optional(),
  roleId: z.uuid().optional(),
  active: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
})

export type CreateUserDto      = z.infer<typeof createUserSchema>
export type UpdateUserDto      = z.infer<typeof updateUserSchema>
export type ChangePasswordDto  = z.infer<typeof changePasswordSchema>
export type UserQuery          = z.infer<typeof userQuerySchema>
