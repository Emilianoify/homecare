import { z } from 'zod'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

const V = ERROR_MESSAGES.AUTH.VALIDATION_ERROR

export const loginSchema = z.object({
  email:    z.email({ error: V }).max(254, { error: V }).transform(v => v.trim().toLowerCase()),
  password: z.string().min(1, { error: V }).max(128, { error: V }),
})

export type LoginDto = z.infer<typeof loginSchema>
