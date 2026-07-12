import { z } from 'zod'
import { IncidentType, IncidentSeverity, IncidentStatus } from '../../../generated/prisma/enums.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

const V  = ERROR_MESSAGES.INCIDENT.VALIDATION_ERROR
const GV = ERROR_MESSAGES.GENERAL.VALIDATION_ERROR

export const createIncidentSchema = z.object({
  type:        z.enum(IncidentType,     { error: V }),
  severity:    z.enum(IncidentSeverity, { error: V }),
  description: z.string().min(10, { error: V }).max(2000, { error: V }),
  occurredAt:  z.iso.datetime({ error: V }),
})

export const updateIncidentStatusSchema = z.object({
  status: z.enum(IncidentStatus, { error: V }),
})

export const resolveIncidentSchema = z.object({
  resolution: z.string().min(10, { error: V }).max(2000, { error: V }),
})

export const incidentParamsSchema = z.object({
  internmentId: z.uuid({ error: GV }),
  incidentId:   z.uuid({ error: GV }),
})

export const internmentParamsSchema = z.object({
  internmentId: z.uuid({ error: GV }),
})

export const incidentQuerySchema = z.object({
  page:     z.coerce.number().int().positive().default(1),
  limit:    z.coerce.number().int().min(1).max(100).default(20),
  severity: z.enum(IncidentSeverity).optional(),
  status:   z.enum(IncidentStatus).optional(),
})

export type CreateIncidentDto        = z.infer<typeof createIncidentSchema>
export type UpdateIncidentStatusDto  = z.infer<typeof updateIncidentStatusSchema>
export type ResolveIncidentDto       = z.infer<typeof resolveIncidentSchema>
export type IncidentQuery            = z.infer<typeof incidentQuerySchema>
