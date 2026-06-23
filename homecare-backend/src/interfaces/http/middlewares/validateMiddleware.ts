import type { Request, Response, NextFunction } from 'express'
import type { ZodSchema } from 'zod'
import { sendBadRequest } from '../../../shared/helpers/responseHelper.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { logger } from '../../../shared/helpers/logger.js'

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      logger.warn('Validation error (body)', { error: result.error.issues, body: req.body })
      sendBadRequest(res, ERROR_MESSAGES.GENERAL.VALIDATION_ERROR)
      return
    }
    req.body = result.data
    next()
  }
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params)
    if (!result.success) {
      logger.warn('Validation error (params)', { error: result.error.issues, params: req.params })
      sendBadRequest(res, ERROR_MESSAGES.GENERAL.VALIDATION_ERROR)
      return
    }
    req.params = result.data as Record<string, string>
    next()
  }
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query)
    if (!result.success) {
      logger.warn('Validation error (query)', { error: result.error.issues, query: req.query })
      sendBadRequest(res, ERROR_MESSAGES.GENERAL.VALIDATION_ERROR)
      return
    }
    Object.defineProperty(req, 'query', {
      value:        result.data,
      writable:     true,
      configurable: true,
      enumerable:   true,
    })
    next()
  }
}
