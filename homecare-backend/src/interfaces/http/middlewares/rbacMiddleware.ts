import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../../../infrastructure/database/prismaClient.js'
import { sendUnauthorized, sendForbidden } from '../../../shared/helpers/responseHelper.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import type { Module, Action } from '../../../shared/constants/modules.js'

export function requirePermission(module: Module, action: Action) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      sendUnauthorized(res, ERROR_MESSAGES.AUTH.UNAUTHORIZED)
      return
    }

    const permission = await prisma.rolePermission.findFirst({
      where: {
        roleId:     req.user.roleId,
        permission: { module, action },
      },
    })

    if (!permission) {
      sendForbidden(res, ERROR_MESSAGES.GENERAL.FORBIDDEN)
      return
    }

    next()
  }
}
