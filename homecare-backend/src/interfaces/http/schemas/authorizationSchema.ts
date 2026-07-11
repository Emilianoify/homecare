import { z } from 'zod'
import { AuthorizationType, AuthorizationStatus } from '../../../generated/prisma/enums.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

const V  = ERROR_MESSAGES.AUTHORIZATION.VALIDATION_ERROR
const GV = ERROR_MESSAGES.GENERAL.VALIDATION_ERROR

export const createAuthorizationSchema = z.object({
  healthInsurerId:   z.uuid({ error: V }),
  number:            z.string().min(3, { error: V }),
  opNumber:          z.string().optional(),
  type:              z.enum(AuthorizationType,  { error: V }),
  validFrom:         z.iso.date({ error: V }),
  validTo:           z.iso.date({ error: V }),
  authorizedModules: z.array(z.string().min(1, { error: V })).min(1, { error: V }),
  notes:             z.string().optional(),
})

export const updateAuthorizationStatusSchema = z.object({
  status: z.enum(AuthorizationStatus, { error: V }),
})

export const authorizationParamsSchema = z.object({
  internmentId:    z.uuid({ error: GV }),
  authorizationId: z.uuid({ error: GV }),
})

export const internmentParamsSchema = z.object({
  internmentId: z.uuid({ error: GV }),
})

export type CreateAuthorizationDto      = z.infer<typeof createAuthorizationSchema>
export type UpdateAuthorizationStatusDto = z.infer<typeof updateAuthorizationStatusSchema>
