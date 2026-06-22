import { z } from 'zod'

export const loginSchema = z.object({
  email:    z.email(),
  password: z.string().min(6),
})

export const registerSchema = z.object({
  email:     z.email(),
  password:  z.string()
               .min(8)
               .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
               .regex(/[0-9]/, 'Debe contener al menos un número'),
  firstName: z.string().min(2).max(100),
  lastName:  z.string().min(2).max(100),
  companyId: z.uuid(),
  branchId:  z.uuid().optional(),
  roleId:    z.uuid(),
})

export type LoginDto    = z.infer<typeof loginSchema>
export type RegisterDto = z.infer<typeof registerSchema>
