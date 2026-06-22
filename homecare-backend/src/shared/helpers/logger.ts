import winston from 'winston'

const { combine, timestamp, errors, json, colorize, printf } = winston.format

const devFormat = combine(
  colorize(),
  timestamp(),
  printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : ''
    return `${String(timestamp)} [${String(level)}] ${String(message)}${metaStr}`
  })
)

const prodFormat = combine(timestamp(), errors({ stack: true }), json())

export const logger = winston.createLogger({
  level: process.env['LOG_LEVEL'] ?? 'info',
  format: process.env['NODE_ENV'] === 'production' ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
})
