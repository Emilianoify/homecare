import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV:             z.enum(['development', 'production', 'test']),
  PORT:                 z.string().transform(Number).pipe(z.number().int().positive()),
  DATABASE_URL:         z.url(),
  JWT_SECRET:           z.string().min(32),
  JWT_EXPIRY:           z.string().default('15m'),
  REFRESH_TOKEN_EXPIRY: z.string().default('7d'),
  CORS_ORIGIN:          z.url(),
  LOG_LEVEL:            z.enum(['error', 'warn', 'info', 'debug']).default('info'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌  Variables de entorno inválidas:')
  console.error(JSON.stringify(parsed.error.issues, null, 2))
  process.exit(1)
}

export const env = parsed.data
