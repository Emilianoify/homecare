import { z } from 'zod'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

const V = ERROR_MESSAGES.AUTH.VALIDATION_ERROR

export const loginSchema = z.object({
  email:    z.email({ error: V }),
  password: z.string().min(6, { error: V }),
})

export const registerSchema = z.object({
  email:     z.email({ error: V }),
  password:  z.string()
               .min(8,  { error: V })
               .regex(/[A-Z]/, { error: V })
               .regex(/[0-9]/, { error: V }),
  firstName: z.string().min(2, { error: V }).max(100, { error: V }),
  lastName:  z.string().min(2, { error: V }).max(100, { error: V }),
  companyId: z.uuid({ error: V }),
  branchId:  z.uuid({ error: V }).optional(),
  roleId:    z.uuid({ error: V }),
})

export type LoginDto    = z.infer<typeof loginSchema>
export type RegisterDto = z.infer<typeof registerSchema>
