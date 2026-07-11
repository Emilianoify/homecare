import { describe, it, expect, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '../../src/main.js'
import { disconnectDatabase } from '../../src/infrastructure/database/prismaClient.js'

afterAll(async () => { await disconnectDatabase() })

describe('GET /health', () => {
  it('retorna status ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})

describe('POST /api/auth/login', () => {
  it('200 con credenciales válidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: process.env['SEED_ADMIN_EMAIL'] || 'admin@homecare.com', password: process.env['SEED_ADMIN_PASSWORD'] || 'Admin123!' })
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.email).toBe(process.env['SEED_ADMIN_EMAIL'] || 'admin@homecare.com')
    expect(res.headers['set-cookie']).toBeDefined()
  })

  it('401 con contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: process.env['SEED_ADMIN_EMAIL'] || 'admin@homecare.com', password: 'wrongpass' })
    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })

  it('400 con body inválido', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noesunemail' })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})

describe('GET /api/auth/me', () => {
  it('401 sin cookie', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })
})
