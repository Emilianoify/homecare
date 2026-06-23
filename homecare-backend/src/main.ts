import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import morgan from 'morgan'
import { env } from './infrastructure/config/env.js'
import { logger } from './shared/helpers/logger.js'
import { apiRouter } from './interfaces/http/routes/index.js'
import { AppError } from './shared/errors/AppError.js'
import { sendInternalError } from './shared/helpers/responseHelper.js'
import { ERROR_MESSAGES } from './shared/constants/messages.js'
import { connectDatabase, disconnectDatabase } from './infrastructure/database/prismaClient.js'
import type { Request, Response, NextFunction } from 'express'

export const app = express()

app.use(helmet())
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(compression())
app.use(morgan('combined', {
  stream: { write: (msg: string) => logger.info(msg.trim()) },
}))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api', apiRouter)

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message })
    return
  }
  logger.error('Error inesperado', err instanceof Error ? { message: err.message, stack: err.stack } : { err })
  sendInternalError(res, ERROR_MESSAGES.GENERAL.INTERNAL_ERROR)
})

async function main(): Promise<void> {
  await connectDatabase()
  app.listen(env.PORT, () => {
    logger.info(`Servidor corriendo en el puerto ${env.PORT} [${env.NODE_ENV}]`)
  })
}

main().catch((err: unknown) => {
  logger.error('Error al iniciar el servidor', { err })
  process.exit(1)
})

process.on('SIGTERM', async () => {
  await disconnectDatabase()
  process.exit(0)
})
