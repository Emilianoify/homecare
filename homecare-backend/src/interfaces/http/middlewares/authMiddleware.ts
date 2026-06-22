import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../../../infrastructure/config/env.js'
import { sendUnauthorized } from '../../../shared/helpers/responseHelper.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

export interface JwtPayload {
  userId:    string
  roleId:    string
  companyId: string
  branchId?: string
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies['access_token'] as string | undefined

  if (!token) {
    sendUnauthorized(res, ERROR_MESSAGES.AUTH.UNAUTHORIZED)
    return
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload
    req.user = payload
    next()
  } catch {
    sendUnauthorized(res, ERROR_MESSAGES.AUTH.TOKEN_EXPIRED)
  }
}
