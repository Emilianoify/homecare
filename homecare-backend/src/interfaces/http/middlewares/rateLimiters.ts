import { rateLimit } from 'express-rate-limit'
import { env } from '../../../infrastructure/config/env.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

const isTest = env.NODE_ENV === 'test'

// Límite global — techo de seguridad para toda la API.
export const globalRateLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  limit:           isTest ? 10000 : 300,
  standardHeaders: 'draft-8',
  legacyHeaders:   false,
  message:         { success: false, message: ERROR_MESSAGES.GENERAL.TOO_MANY_REQUESTS },
})

// Login — estricto, freno anti brute-force de credenciales.
export const loginRateLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  limit:           isTest ? 10000 : 5,
  standardHeaders: 'draft-8',
  legacyHeaders:   false,
  message:         { success: false, message: ERROR_MESSAGES.GENERAL.TOO_MANY_REQUESTS },
})

// Refresh — el refresh legítimo ocurre ~1 vez cada 15 min por usuario.
export const refreshRateLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  limit:           isTest ? 10000 : 30,
  standardHeaders: 'draft-8',
  legacyHeaders:   false,
  message:         { success: false, message: ERROR_MESSAGES.GENERAL.TOO_MANY_REQUESTS },
})
