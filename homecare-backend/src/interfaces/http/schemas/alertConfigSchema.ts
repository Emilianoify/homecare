import { z } from 'zod'
import { AlertTriggerType } from '../../../generated/prisma/enums.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

const V  = ERROR_MESSAGES.ALERT_CONFIG.VALIDATION_ERROR
const GV = ERROR_MESSAGES.GENERAL.VALIDATION_ERROR

export const createAlertConfigSchema = z.object({
  triggerType:   z.enum(AlertTriggerType, { error: V }),
  thresholdDays: z.number().int().min(1, { error: V }).max(365, { error: V }),
  active:        z.boolean().default(true),
  notifyRoles:   z.array(
                   z.string().min(1, { error: V }).max(50, { error: V })
                 ).min(1, { error: V }).max(10, { error: V }),
})

export const updateAlertConfigSchema = z.object({
  thresholdDays: z.number().int().min(1, { error: V }).max(365, { error: V }).optional(),
  active:        z.boolean().optional(),
  notifyRoles:   z.array(
                   z.string().min(1, { error: V }).max(50, { error: V })
                 ).min(1, { error: V }).max(10, { error: V }).optional(),
})

export const alertConfigParamsSchema = z.object({
  id: z.uuid({ error: GV }),
})

export const alertConfigQuerySchema = z.object({
  onlyActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
})

export type CreateAlertConfigDto = z.infer<typeof createAlertConfigSchema>
export type UpdateAlertConfigDto = z.infer<typeof updateAlertConfigSchema>
export type AlertConfigQuery     = z.infer<typeof alertConfigQuerySchema>
