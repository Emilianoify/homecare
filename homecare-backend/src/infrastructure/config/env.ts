import 'dotenv/config'
import { z } from 'zod'
import { ERROR_MESSAGES } from '../../shared/constants/messages.js'

const envSchema = z.object({
  NODE_ENV:             z.enum(['development', 'production', 'test'], {
                          error: ERROR_MESSAGES.GENERAL.VALIDATION_ERROR,
                        }),
  PORT:                 z.coerce.number().int().positive().default(3001),
  DATABASE_URL:         z.url({ error: ERROR_MESSAGES.GENERAL.VALIDATION_ERROR }),
  JWT_SECRET:           z.string().min(32, { error: ERROR_MESSAGES.GENERAL.VALIDATION_ERROR }),
  JWT_EXPIRY:           z.string().default('15m'),
  REFRESH_TOKEN_EXPIRY: z.string().default('7d'),
  CORS_ORIGIN:          z.url({ error: ERROR_MESSAGES.GENERAL.VALIDATION_ERROR }),
  LOG_LEVEL:            z.enum(['error', 'warn', 'info', 'debug']).default('info'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const errorsList = parsed.error.issues
    .map(issue => `  - Campo "${issue.path.join('.')}": ${issue.message}`)
    .join('\n')
  throw new Error(`❌ Variables de entorno inválidas:\n${errorsList}`)
}

export const env = parsed.data
export type Env = z.infer<typeof envSchema>
