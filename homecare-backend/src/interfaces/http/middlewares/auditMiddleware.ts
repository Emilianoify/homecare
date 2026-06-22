import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../../../infrastructure/database/prismaClient.js'
import { logger } from '../../../shared/helpers/logger.js'

export function auditMutations(req: Request, _res: Response, next: NextFunction): void {
  const mutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)

  if (!mutating || !req.user) {
    next()
    return
  }

  const entity   = req.path.split('/')[1] ?? 'unknown'
  const entityId = (req.params['id'] as string | undefined) ?? 'N/A'

  prisma.auditLog.create({
    data: {
      userId:    req.user.userId,
      companyId: req.user.companyId,
      action:    req.method === 'POST'   ? 'CREATE'
               : req.method === 'DELETE' ? 'DELETE'
               : 'UPDATE',
      entity,
      entityId,
      ip: req.ip ?? 'unknown',
    },
  }).catch((err: unknown) => logger.error('Error al registrar auditoría', { err }))

  next()
}
