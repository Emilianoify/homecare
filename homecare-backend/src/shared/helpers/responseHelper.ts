import type { Response } from 'express'

interface Meta {
  page:       number
  limit:      number
  total:      number
  totalPages: number
}

function respond(
  res:     Response,
  status:  number,
  success: boolean,
  message: string,
  data?:   unknown
): void {
  res.status(status).json({
    success,
    message,
    ...(data !== undefined && { data }),
  })
}

export const sendOk            = (res: Response, message: string, data?: unknown): void => respond(res, 200, true,  message, data)
export const sendCreated       = (res: Response, message: string, data?: unknown): void => respond(res, 201, true,  message, data)
export const sendNoContent     = (res: Response): void                                  => { res.status(204).send() }
export const sendBadRequest    = (res: Response, message: string): void                 => respond(res, 400, false, message)
export const sendUnauthorized  = (res: Response, message: string): void                 => respond(res, 401, false, message)
export const sendForbidden     = (res: Response, message: string): void                 => respond(res, 403, false, message)
export const sendNotFound      = (res: Response, message: string): void                 => respond(res, 404, false, message)
export const sendConflict      = (res: Response, message: string): void                 => respond(res, 409, false, message)
export const sendInternalError = (res: Response, message: string): void                 => respond(res, 500, false, message)

export function sendPaginated<T>(res: Response, message: string, data: T[], meta: Meta): void {
  res.status(200).json({ success: true, message, data, meta })
}
