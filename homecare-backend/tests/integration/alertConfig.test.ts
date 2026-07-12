import { describe, it, expect, afterAll, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../../src/main.js'
import { prisma, disconnectDatabase } from '../../src/infrastructure/database/prismaClient.js'

let authCookie: string
let otherCompanyAuthCookie: string
let companyId: string
const nonExistentId = 'aaaaaaaa-0000-4000-a000-000000000000'

beforeAll(async () => {
  // 1. Log in as primary seeded admin
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: process.env['SEED_ADMIN_EMAIL'] || 'admin@homecare.com', password: process.env['SEED_ADMIN_PASSWORD'] || 'Admin123!' })
  
  const cookies = res.headers['set-cookie'] as unknown as string[] | undefined
  if (cookies) {
    const tokenCookie = cookies.find(c => c.startsWith('access_token='))
    if (tokenCookie) {
      authCookie = tokenCookie.split(';')[0]!
    }
  }

  // 2. Retrieve primary company
  const company = await prisma.company.findFirst({ where: { cuit: '30-12345678-9' } })
  if (!company) throw new Error('Seeded company not found')
  companyId = company.id

  // 3. Create another company and user for cross-tenant testing
  const otherCompany = await prisma.company.upsert({
    where:  { cuit: '30-98765432-1' },
    update: {},
    create: {
      legalName:    'Other Company SA',
      cuit:         '30-98765432-1',
      vatCondition: 'REGISTERED_TAXPAYER',
      address:      'Av. Callao 123',
      city:         'Buenos Aires',
      province:     'CABA',
    }
  })

  const otherRole = await prisma.role.upsert({
    where:  { companyId_name: { companyId: otherCompany.id, name: 'ADMIN' } },
    update: {},
    create: { companyId: otherCompany.id, name: 'ADMIN', description: 'Acceso total', isSystem: true },
  })

  // Assign quality module permissions to other admin role to bypass permission check but fail on tenant isolation
  const allPermissions = await prisma.permission.findMany()
  for (const p of allPermissions) {
    await prisma.rolePermission.upsert({
      where:  { roleId_permissionId: { roleId: otherRole.id, permissionId: p.id } },
      update: {},
      create: { roleId: otherRole.id, permissionId: p.id },
    })
  }

  const otherUser = await prisma.user.upsert({
    where:  { email: 'other@homecare.com' },
    update: {},
    create: {
      email:        'other@homecare.com',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$S20xMWZpSGs$65xWb4qD3vR1/0hD9Q/2xQ', // dummy argon2 hash
      firstName:    'Other',
      lastName:     'Admin',
      roleId:       otherRole.id,
      companyId:    otherCompany.id,
    }
  })

  const otherRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'other@homecare.com', password: 'password' }) // Wait, dummy hash is not verified easily without seeding, let's login by hacking session or just log in directly. Wait! The loginUseCase verified using argon2.hash. If passwordHash was created with 'password' it will match. Wait, let's check what the password in dummy hash is. It's actually easier to hash a real password or we can just use password 'Admin123!' with a proper hash, or we can just create a proper hash.
    // Let's create a known hash for argon2.
  
  // Wait, let's look at the seed code. Seed admin uses argon2.
  // Let's seed other user with password 'Admin123!' hashed using argon2.
})

afterAll(async () => {
  await prisma.refreshToken.deleteMany({ where: { user: { email: 'other@homecare.com' } } })
  await prisma.user.deleteMany({ where: { email: 'other@homecare.com' } })
  await prisma.rolePermission.deleteMany({ where: { role: { company: { cuit: '30-98765432-1' } } } })
  await prisma.role.deleteMany({ where: { company: { cuit: '30-98765432-1' } } })
  await prisma.company.deleteMany({ where: { cuit: '30-98765432-1' } })
  await disconnectDatabase()
})

describe('AlertConfig Endpoints Integration Tests', () => {
  let createdConfigId: string
  let inactiveConfigId: string

  beforeAll(async () => {
    // Hash for 'Admin123!'
    const argon2 = await import('argon2')
    const passwordHash = await argon2.hash('Admin123!', {
      type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 4,
    })

    await prisma.user.update({
      where: { email: 'other@homecare.com' },
      data: { passwordHash }
    })

    const otherRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'other@homecare.com', password: 'Admin123!' })
    
    const cookies = otherRes.headers['set-cookie'] as unknown as string[] | undefined
    if (cookies) {
      const tokenCookie = cookies.find(c => c.startsWith('access_token='))
      if (tokenCookie) {
        otherCompanyAuthCookie = tokenCookie.split(';')[0]!
      }
    }
  })

  describe('GET /api/alert-configs', () => {
    it('debe retornar 401 si no está autenticado', async () => {
      const res = await request(app)
        .get('/api/alert-configs')
      expect(res.status).toBe(401)
    })

    it('debe listar todas las configuraciones de alerta para la company del usuario (200)', async () => {
      const res = await request(app)
        .get('/api/alert-configs')
        .set('Cookie', authCookie)
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toBeInstanceOf(Array)
      expect(res.body.data.length).toBe(4) // 4 seeded configs
    })

    it('debe filtrar por activas usando onlyActive=true', async () => {
      const res = await request(app)
        .get('/api/alert-configs?onlyActive=true')
        .set('Cookie', authCookie)
      expect(res.status).toBe(200)
      expect(res.body.data.every((c: any) => c.active === true)).toBe(true)
    })
  })

  describe('POST /api/alert-configs', () => {
    it('debe retornar 401 si no está autenticado', async () => {
      const res = await request(app)
        .post('/api/alert-configs')
        .send({
          triggerType:   'NO_FUNCTIONAL_STATUS',
          thresholdDays: 14,
          active:        true,
          notifyRoles:   ['COORDINATOR'],
        })
      expect(res.status).toBe(401)
    })

    it('debe crear un alert config exitosamente (201)', async () => {
      const res = await request(app)
        .post('/api/alert-configs')
        .set('Cookie', authCookie)
        .send({
          triggerType:   'NO_FUNCTIONAL_STATUS',
          thresholdDays: 14,
          active:        true,
          notifyRoles:   ['COORDINATOR'],
        })
      expect(res.status).toBe(201)
      expect(res.body.data.triggerType).toBe('NO_FUNCTIONAL_STATUS')
      expect(res.body.data.thresholdDays).toBe(14)
      expect(res.body.data.active).toBe(true)
      expect(res.body.data.notifyRoles).toEqual(['COORDINATOR'])
      createdConfigId = res.body.data.id
    })

    it('debe retornar 409 si se intenta crear una config activa con triggerType ya existente y activo', async () => {
      const res = await request(app)
        .post('/api/alert-configs')
        .set('Cookie', authCookie)
        .send({
          triggerType:   'NO_VISIT',
          thresholdDays: 5,
          active:        true,
          notifyRoles:   ['ADMIN'],
        })
      expect(res.status).toBe(409)
    })

    it('debe permitir crear una config inactiva con triggerType ya existente y activo (201)', async () => {
      const res = await request(app)
        .post('/api/alert-configs')
        .set('Cookie', authCookie)
        .send({
          triggerType:   'NO_VISIT',
          thresholdDays: 2,
          active:        false,
          notifyRoles:   ['COORDINATOR'],
        })
      expect(res.status).toBe(201)
      inactiveConfigId = res.body.data.id
    })

    it('debe retornar 400 si notifyRoles está vacío', async () => {
      const res = await request(app)
        .post('/api/alert-configs')
        .set('Cookie', authCookie)
        .send({
          triggerType:   'NO_VISIT',
          thresholdDays: 5,
          active:        false,
          notifyRoles:   [],
        })
      expect(res.status).toBe(400)
    })

    it('debe retornar 400 si thresholdDays está fuera de rango (>365)', async () => {
      const res = await request(app)
        .post('/api/alert-configs')
        .set('Cookie', authCookie)
        .send({
          triggerType:   'NO_VISIT',
          thresholdDays: 400,
          active:        false,
          notifyRoles:   ['ADMIN'],
        })
      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/alert-configs/:id', () => {
    it('debe retornar el detalle (200)', async () => {
      const res = await request(app)
        .get(`/api/alert-configs/${createdConfigId}`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(200)
      expect(res.body.data.id).toBe(createdConfigId)
    })

    it('debe retornar 404 para una id de otra company', async () => {
      const res = await request(app)
        .get(`/api/alert-configs/${createdConfigId}`)
        .set('Cookie', otherCompanyAuthCookie)
      expect(res.status).toBe(404)
    })
  })

  describe('PUT /api/alert-configs/:id', () => {
    it('debe actualizar el umbral (200)', async () => {
      const res = await request(app)
        .put(`/api/alert-configs/${createdConfigId}`)
        .set('Cookie', authCookie)
        .send({ thresholdDays: 4 })
      expect(res.status).toBe(200)
      expect(res.body.data.thresholdDays).toBe(4)
    })

    it('debe retornar 409 al intentar activar una config cuando ya existe otra activa del mismo tipo', async () => {
      const res = await request(app)
        .put(`/api/alert-configs/${inactiveConfigId}`)
        .set('Cookie', authCookie)
        .send({ active: true })
      expect(res.status).toBe(409)
    })
  })

  describe('DELETE /api/alert-configs/:id', () => {
    it('debe soft-deletar la config (204)', async () => {
      const res = await request(app)
        .delete(`/api/alert-configs/${createdConfigId}`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(204)
      
      // Verify it is not listed anymore
      const listRes = await request(app)
        .get('/api/alert-configs')
        .set('Cookie', authCookie)
      expect(listRes.body.data.some((c: any) => c.id === createdConfigId)).toBe(false)
    })
  })
})
