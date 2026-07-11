import { describe, it, expect, afterAll, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../../src/main.js'
import { prisma, disconnectDatabase } from '../../src/infrastructure/database/prismaClient.js'

let authCookie: string
let companyId: string
const nonExistentId = 'aaaaaaaa-0000-4000-a000-000000000000'

describe('Branch Endpoints Integration Tests', () => {
  let createdBranchId: string
  let otherCompanyBranchId: string
  let otherCompanyId: string

  beforeAll(async () => {
    // Clean up any leaked test data from previous runs
    await prisma.company.deleteMany({ where: { cuit: '33-99999999-9' } })

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

    // 2. Retrieve the admin's companyId
    const company = await prisma.company.findFirst({
      where: { tradeName: undefined } // Just get the first company
    })
    if (!company) throw new Error('No company found in database')
    companyId = company.id

    // 3. Create another company and a branch for it to test isolation
    const otherCompany = await prisma.company.create({
      data: {
        legalName:    'Other Company S.A.',
        cuit:         '33-99999999-9',
        vatCondition: 'REGISTERED_TAXPAYER',
        address:      'Calle 1 123',
        city:         'La Plata',
        province:     'Buenos Aires',
      }
    })
    otherCompanyId = otherCompany.id

    const otherBranch = await prisma.branch.create({
      data: {
        companyId: otherCompanyId,
        name:      'Sucursal Aislada',
        address:   'Calle 2 456',
        city:      'La Plata',
        active:    true,
      }
    })
    otherCompanyBranchId = otherBranch.id
  })

  afterAll(async () => {
    // Clean up
    if (createdBranchId) {
      await prisma.branch.delete({ where: { id: createdBranchId } }).catch(() => {})
    }
    if (otherCompanyBranchId) {
      await prisma.branch.delete({ where: { id: otherCompanyBranchId } }).catch(() => {})
    }
    if (otherCompanyId) {
      await prisma.company.delete({ where: { id: otherCompanyId } }).catch(() => {})
    }

    await disconnectDatabase()
  })

  describe('POST /api/branches', () => {
    it('debe retornar 401 si no hay cookie de autenticación', async () => {
      const res = await request(app)
        .post('/api/branches')
        .send({
          name:    'Sucursal Test',
          address: 'Calle Test 1234',
        })
      expect(res.status).toBe(401)
    })

    it('debe retornar 400 si el body es inválido (nombre muy corto)', async () => {
      const res = await request(app)
        .post('/api/branches')
        .set('Cookie', authCookie)
        .send({
          name:    'A',
          address: 'Calle Test 1234',
        })
      expect(res.status).toBe(400)
    })

    it('debe crear correctamente la sucursal (201)', async () => {
      const res = await request(app)
        .post('/api/branches')
        .set('Cookie', authCookie)
        .send({
          name:    'Sucursal Oeste',
          address: 'Calle Oeste 4567',
          city:    'Morón',
          phone:   '1155556666',
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBeDefined()
      expect(res.body.data.companyId).toBe(companyId) // Asegura que hereda req.user.companyId
      expect(res.body.data.name).toBe('Sucursal Oeste')
      expect(res.body.data.active).toBe(true)

      createdBranchId = res.body.data.id
    })
  })

  describe('GET /api/branches', () => {
    it('debe retornar 401 si no hay cookie de autenticación', async () => {
      const res = await request(app)
        .get('/api/branches')
      expect(res.status).toBe(401)
    })

    it('debe retornar la lista de sucursales ordenada por nombre', async () => {
      const res = await request(app)
        .get('/api/branches')
        .set('Cookie', authCookie)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toBeInstanceOf(Array)
      // Debe haber al menos la Casa Central (sembrada) y la Sucursal Oeste creada
      expect(res.body.data.length).toBeGreaterThanOrEqual(2)

      // Verificar orden ascendente por nombre
      const names: string[] = res.body.data.map((b: { name: string }) => b.name)
      const sortedNames = [...names].sort((a, b) => a.localeCompare(b))
      expect(names).toEqual(sortedNames)
    })

    it('no debe incluir sucursales de otra company', async () => {
      const res = await request(app)
        .get('/api/branches')
        .set('Cookie', authCookie)

      const ids = res.body.data.map((b: { id: string }) => b.id)
      expect(ids).not.toContain(otherCompanyBranchId)
    })
  })

  describe('GET /api/branches/:id', () => {
    it('debe retornar 401 si no hay cookie de autenticación', async () => {
      const res = await request(app)
        .get(`/api/branches/${createdBranchId}`)
      expect(res.status).toBe(401)
    })

    it('debe retornar 404 para una sucursal inexistente', async () => {
      const res = await request(app)
        .get(`/api/branches/${nonExistentId}`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(404)
    })

    it('debe retornar 404 para una sucursal de otra company', async () => {
      const res = await request(app)
        .get(`/api/branches/${otherCompanyBranchId}`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(404)
    })

    it('debe retornar el detalle de la sucursal propia (200)', async () => {
      const res = await request(app)
        .get(`/api/branches/${createdBranchId}`)
        .set('Cookie', authCookie)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.name).toBe('Sucursal Oeste')
    })
  })

  describe('PUT /api/branches/:id', () => {
    it('debe retornar 401 si no hay cookie de autenticación', async () => {
      const res = await request(app)
        .put(`/api/branches/${createdBranchId}`)
        .send({ name: 'Nuevo Nombre' })
      expect(res.status).toBe(401)
    })

    it('debe retornar 404 al intentar actualizar una sucursal de otra company', async () => {
      const res = await request(app)
        .put(`/api/branches/${otherCompanyBranchId}`)
        .set('Cookie', authCookie)
        .send({ name: 'Nuevo Nombre' })
      expect(res.status).toBe(404)
    })

    it('debe actualizar campos correctamente y permitir desactivar (200)', async () => {
      const res = await request(app)
        .put(`/api/branches/${createdBranchId}`)
        .set('Cookie', authCookie)
        .send({
          phone:  '1199998888',
          active: false,
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.phone).toBe('1199998888')
      expect(res.body.data.active).toBe(false)
    })
  })

  describe('DELETE /api/branches/:id', () => {
    it('debe retornar 401 si no hay cookie de autenticación', async () => {
      const res = await request(app)
        .delete(`/api/branches/${createdBranchId}`)
      expect(res.status).toBe(401)
    })

    it('debe retornar 404 al intentar eliminar una sucursal de otra company', async () => {
      const res = await request(app)
        .delete(`/api/branches/${otherCompanyBranchId}`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(404)
    })

    it('debe realizar soft delete de la sucursal (204)', async () => {
      const res = await request(app)
        .delete(`/api/branches/${createdBranchId}`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(204)

      // Verificar que no se puede obtener por ID
      const getRes = await request(app)
        .get(`/api/branches/${createdBranchId}`)
        .set('Cookie', authCookie)
      expect(getRes.status).toBe(404)

      // Verificar que no aparece en el listado
      const listRes = await request(app)
        .get('/api/branches')
        .set('Cookie', authCookie)
      const ids = listRes.body.data.map((b: { id: string }) => b.id)
      expect(ids).not.toContain(createdBranchId)
    })
  })
})
