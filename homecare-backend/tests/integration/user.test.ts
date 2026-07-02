import { describe, it, expect, afterAll, beforeAll } from 'vitest'
import request from 'supertest'
import argon2 from 'argon2'
import { app } from '../../src/main.js'
import { prisma, disconnectDatabase } from '../../src/infrastructure/database/prismaClient.js'

let authCookie: string
let companyId: string
let adminUserId: string
let adminRoleId: string
const nonExistentId = 'aaaaaaaa-0000-4000-a000-000000000000'

describe('User Endpoints Integration Tests', () => {
  let createdUserId: string
  let otherCompanyUserId: string
  let otherCompanyId: string
  let testRoleId: string

  beforeAll(async () => {
    // 1. Log in as the seeded admin to get the session cookie
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@homecare.com', password: 'Admin123!' })

    const cookies = loginRes.headers['set-cookie'] as unknown as string[] | undefined
    if (cookies) {
      const tokenCookie = cookies.find(c => c.startsWith('access_token='))
      if (tokenCookie) {
        authCookie = tokenCookie.split(';')[0]!
      }
    }

    // 2. Retrieve seeded admin and role details
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@homecare.com' }
    })
    if (!adminUser) throw new Error('Seeded admin user not found')
    adminUserId = adminUser.id
    companyId = adminUser.companyId
    adminRoleId = adminUser.roleId

    // 3. Create a test role in company
    const role = await prisma.role.create({
      data: {
        companyId,
        name:        'TEST_ROLE',
        description: 'Test Role Description',
      }
    })
    testRoleId = role.id

    // 4. Create another company and a user for it to test isolation
    const otherCompany = await prisma.company.create({
      data: {
        legalName:    'Other Company S.A.',
        cuit:         '33-99999991-9',
        vatCondition: 'REGISTERED_TAXPAYER',
        address:      'Calle 1 123',
        city:         'La Plata',
        province:     'Buenos Aires',
      }
    })
    otherCompanyId = otherCompany.id

    const otherRole = await prisma.role.create({
      data: {
        companyId: otherCompanyId,
        name:      'OTHER_ADMIN_ROLE',
      }
    })

    const otherUser = await prisma.user.create({
      data: {
        companyId:    otherCompanyId,
        email:        'isolated@othercompany.com',
        passwordHash: 'some_hash',
        firstName:    'Isolated',
        lastName:     'User',
        roleId:       otherRole.id,
      }
    })
    otherCompanyUserId = otherUser.id
  })

  afterAll(async () => {
    // Clean up
    if (createdUserId) {
      await prisma.user.delete({ where: { id: createdUserId } }).catch(() => {})
    }
    if (otherCompanyUserId) {
      await prisma.user.delete({ where: { id: otherCompanyUserId } }).catch(() => {})
    }
    if (testRoleId) {
      await prisma.role.delete({ where: { id: testRoleId } }).catch(() => {})
    }
    if (otherCompanyId) {
      await prisma.role.deleteMany({ where: { companyId: otherCompanyId } }).catch(() => {})
      await prisma.company.delete({ where: { id: otherCompanyId } }).catch(() => {})
    }

    await disconnectDatabase()
  })

  describe('POST /api/users', () => {
    it('debe retornar 401 si no hay cookie de autenticación', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({
          email:     'test@homecare.com',
          password:  'Pass1234!',
          firstName: 'John',
          lastName:  'Doe',
          roleId:    testRoleId,
        })
      expect(res.status).toBe(401)
    })

    it('debe retornar 400 si el password es débil (sin mayúscula)', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Cookie', authCookie)
        .send({
          email:     'test@homecare.com',
          password:  'pass1234!', // sin mayúscula
          firstName: 'John',
          lastName:  'Doe',
          roleId:    testRoleId,
        })
      expect(res.status).toBe(400)
    })

    it('debe crear correctamente el usuario (201)', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Cookie', authCookie)
        .send({
          email:     'coordinadora@homecare.com',
          password:  'Coord123!',
          firstName: 'Laura',
          lastName:  'Méndez',
          roleId:    testRoleId,
          active:    true,
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBeDefined()
      expect(res.body.data.email).toBe('coordinadora@homecare.com')
      expect(res.body.data.firstName).toBe('Laura')
      expect(res.body.data.lastName).toBe('Méndez')
      expect(res.body.data.fullName).toBe('Méndez, Laura')
      expect(res.body.data.passwordHash).toBeUndefined() // Asegura que no se retorna passwordHash

      createdUserId = res.body.data.id
    })

    it('debe retornar 409 si el email ya existe', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Cookie', authCookie)
        .send({
          email:     'coordinadora@homecare.com', // ya existe
          password:  'Coord123!',
          firstName: 'Laura',
          lastName:  'Méndez',
          roleId:    testRoleId,
        })
      expect(res.status).toBe(409)
      expect(res.body.success).toBe(false)
    })
  })

  describe('GET /api/users', () => {
    it('debe retornar la lista paginada de usuarios', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Cookie', authCookie)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.items).toBeInstanceOf(Array)
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(2) // admin y la coordinadora creada

      // Verificar que ningún item tiene passwordHash
      for (const item of res.body.data.items) {
        expect(item.passwordHash).toBeUndefined()
        expect(item.roleName).toBeDefined()
      }
    })

    it('debe filtrar correctamente por nombre', async () => {
      const res = await request(app)
        .get('/api/users?search=Méndez')
        .set('Cookie', authCookie)

      expect(res.status).toBe(200)
      expect(res.body.data.items.length).toBe(1)
      expect(res.body.data.items[0].email).toBe('coordinadora@homecare.com')
    })

    it('debe filtrar correctamente por rol', async () => {
      const res = await request(app)
        .get(`/api/users?roleId=${testRoleId}`)
        .set('Cookie', authCookie)

      expect(res.status).toBe(200)
      expect(res.body.data.items.length).toBe(1)
      expect(res.body.data.items[0].roleId).toBe(testRoleId)
    })

    it('debe filtrar correctamente por estado activo', async () => {
      const res = await request(app)
        .get('/api/users?active=true')
        .set('Cookie', authCookie)

      expect(res.status).toBe(200)
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(2)
    })

    it('no debe incluir usuarios de otra company', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Cookie', authCookie)

      const ids = res.body.data.items.map((u: { id: string }) => u.id)
      expect(ids).not.toContain(otherCompanyUserId)
    })
  })

  describe('GET /api/users/:id', () => {
    it('debe retornar 404 para un usuario de otra company', async () => {
      const res = await request(app)
        .get(`/api/users/${otherCompanyUserId}`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(404)
    })

    it('debe retornar el detalle del usuario propio sin passwordHash', async () => {
      const res = await request(app)
        .get(`/api/users/${createdUserId}`)
        .set('Cookie', authCookie)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.email).toBe('coordinadora@homecare.com')
      expect(res.body.data.passwordHash).toBeUndefined()
    })
  })

  describe('PUT /api/users/:id', () => {
    it('debe actualizar los datos de un usuario e ignorar el campo password', async () => {
      // 1. Update user
      const res = await request(app)
        .put(`/api/users/${createdUserId}`)
        .set('Cookie', authCookie)
        .send({
          firstName: 'Laura Beatriz',
          password:  'NuevoPasswordIntentado123!', // Debe ignorarse
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.firstName).toBe('Laura Beatriz')

      // 2. Verify that password did NOT change by comparing it against old password hash in database
      const dbUser = await prisma.user.findUnique({
        where: { id: createdUserId }
      })
      if (!dbUser) throw new Error('User not found in DB')
      const matchOld = await argon2.verify(dbUser.passwordHash, 'Coord123!')
      expect(matchOld).toBe(true) // Old password remains valid
    })
  })

  describe('PATCH /api/users/:id/password', () => {
    it('debe fallar si la contraseña actual es incorrecta', async () => {
      const res = await request(app)
        .patch(`/api/users/${createdUserId}/password`)
        .set('Cookie', authCookie)
        .send({
          currentPassword: 'IncorrectPassword',
          newPassword:     'NuevaClave123!',
        })
      expect(res.status).toBe(400)
      expect(res.body.message).toContain('La contraseña actual es incorrecta')
    })

    it('debe cambiar correctamente la contraseña de un usuario', async () => {
      // 1. Change password
      const res = await request(app)
        .patch(`/api/users/${createdUserId}/password`)
        .set('Cookie', authCookie)
        .send({
          currentPassword: 'Coord123!',
          newPassword:     'NuevaClave123!',
        })
      expect(res.status).toBe(200)

      // 2. Verify new password in database
      const dbUser = await prisma.user.findUnique({
        where: { id: createdUserId }
      })
      if (!dbUser) throw new Error('User not found in DB')
      const matchNew = await argon2.verify(dbUser.passwordHash, 'NuevaClave123!')
      expect(matchNew).toBe(true)
    })
  })

  describe('DELETE /api/users/:id', () => {
    it('debe retornar 400 si un usuario intenta eliminarse a sí mismo', async () => {
      const res = await request(app)
        .delete(`/api/users/${adminUserId}`)
        .set('Cookie', authCookie)

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toContain('No podés eliminar tu propio usuario')
    })

    it('debe realizar soft delete de otro usuario (204)', async () => {
      const res = await request(app)
        .delete(`/api/users/${createdUserId}`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(204)

      // Verificar que no se puede obtener por ID
      const getRes = await request(app)
        .get(`/api/users/${createdUserId}`)
        .set('Cookie', authCookie)
      expect(getRes.status).toBe(404)

      // Verificar que no aparece en el listado
      const listRes = await request(app)
        .get('/api/users')
        .set('Cookie', authCookie)
      const ids = listRes.body.data.items.map((u: { id: string }) => u.id)
      expect(ids).not.toContain(createdUserId)
    })
  })
})
