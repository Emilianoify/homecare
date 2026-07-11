import { describe, it, expect, afterAll, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../../src/main.js'
import { prisma, disconnectDatabase } from '../../src/infrastructure/database/prismaClient.js'

let authCookie: string
let companyId: string
const nonExistentId = 'aaaaaaaa-0000-4000-a000-000000000000'

describe('HealthInsurer Endpoints Integration Tests', () => {
  let createdInsurerId: string
  let otherCompanyInsurerId: string
  let otherCompanyId: string

  beforeAll(async () => {
    // Clean up any leaked test data from previous runs
    await prisma.healthInsurer.deleteMany({ where: { cuit: '30-57411040-2' } })
    await prisma.company.deleteMany({ where: { cuit: '33-88888888-9' } })

    // 1. Log in as the seeded admin to get the session cookie
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: process.env['SEED_ADMIN_EMAIL'] || 'admin@homecare.com', password: process.env['SEED_ADMIN_PASSWORD'] || 'Admin123!' })

    const cookies = loginRes.headers['set-cookie'] as unknown as string[] | undefined
    if (cookies) {
      const tokenCookie = cookies.find(c => c.startsWith('access_token='))
      if (tokenCookie) {
        authCookie = tokenCookie.split(';')[0]!
      }
    }

    // 2. Retrieve admin's companyId
    const company = await prisma.company.findFirst()
    if (!company) throw new Error('No company found in database')
    companyId = company.id

    // 3. Create another company and a health insurer for it to test isolation
    const otherCompany = await prisma.company.create({
      data: {
        legalName:    'Other Company S.A.',
        cuit:         '33-88888888-9',
        vatCondition: 'REGISTERED_TAXPAYER',
        address:      'Calle 1 123',
        city:         'La Plata',
        province:     'Buenos Aires',
      }
    })
    otherCompanyId = otherCompany.id

    const otherInsurer = await prisma.healthInsurer.create({
      data: {
        companyId:      otherCompanyId,
        name:           'Swiss Medical Group',
        acronym:        'SWISS',
        cuit:           '30-57411040-2', // unique cuit for other company
        insurerType:    'PREPAID',
        billingMode:    'PER_VISIT',
        active:         true,
      }
    })
    otherCompanyInsurerId = otherInsurer.id
  })

  afterAll(async () => {
    // Clean up
    if (createdInsurerId) {
      await prisma.healthInsurer.delete({ where: { id: createdInsurerId } }).catch(() => {})
    }
    if (otherCompanyInsurerId) {
      await prisma.healthInsurer.delete({ where: { id: otherCompanyInsurerId } }).catch(() => {})
    }
    if (otherCompanyId) {
      await prisma.healthInsurer.deleteMany({ where: { companyId: otherCompanyId } }).catch(() => {})
      await prisma.company.delete({ where: { id: otherCompanyId } }).catch(() => {})
    }

    await disconnectDatabase()
  })

  describe('POST /api/health-insurers', () => {
    it('debe retornar 401 si no hay cookie de autenticación', async () => {
      const res = await request(app)
        .post('/api/health-insurers')
        .send({
          name:        'Galeno Argentina',
          acronym:     'GALENO',
          cuit:        '30-70793626-4',
          insurerType: 'PREPAID',
          billingMode: 'PER_VISIT',
        })
      expect(res.status).toBe(401)
    })

    it('debe retornar 400 si el CUIT tiene formato inválido', async () => {
      const res = await request(app)
        .post('/api/health-insurers')
        .set('Cookie', authCookie)
        .send({
          name:        'Galeno Argentina',
          acronym:     'GALENO',
          cuit:        '30707936264', // formato inválido (sin guiones)
          insurerType: 'PREPAID',
          billingMode: 'PER_VISIT',
        })
      expect(res.status).toBe(400)
    })

    it('debe crear correctamente la obra social (201)', async () => {
      const res = await request(app)
        .post('/api/health-insurers')
        .set('Cookie', authCookie)
        .send({
          name:           'Galeno Argentina',
          acronym:        'GALENO',
          cuit:           '30-70793626-4',
          insurerType:    'PREPAID',
          billingMode:    'PER_VISIT',
          cutoffDay:      15,
          paymentDays:    30,
          requiresPaper:  false,
          operativeNotes: 'Portal: prestadores.galeno.com.ar\nAutorización online.',
          active:         true,
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBeDefined()
      expect(res.body.data.companyId).toBe(companyId)
      expect(res.body.data.name).toBe('Galeno Argentina')
      expect(res.body.data.operativeNotes).toBe('Portal: prestadores.galeno.com.ar\nAutorización online.')

      createdInsurerId = res.body.data.id
    })

    it('debe retornar 409 si el CUIT ya existe en la misma company', async () => {
      const res = await request(app)
        .post('/api/health-insurers')
        .set('Cookie', authCookie)
        .send({
          name:        'Galeno Bis',
          acronym:     'GALENO2',
          cuit:        '30-70793626-4', // ya existente
          insurerType: 'PREPAID',
          billingMode: 'PER_VISIT',
        })
      expect(res.status).toBe(409)
    })
  })

  describe('GET /api/health-insurers', () => {
    it('debe retornar la lista paginada de obras sociales', async () => {
      const res = await request(app)
        .get('/api/health-insurers')
        .set('Cookie', authCookie)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toBeInstanceOf(Array)
      expect(res.body.data.length).toBeGreaterThanOrEqual(1)

      // Verificar orden por nombre
      const names: string[] = res.body.data.map((h: { name: string }) => h.name)
      const sortedNames = [...names].sort((a, b) => a.localeCompare(b))
      expect(names).toEqual(sortedNames)
    })

    it('debe filtrar correctamente por nombre en search', async () => {
      const res = await request(app)
        .get('/api/health-insurers?search=Galeno')
        .set('Cookie', authCookie)

      expect(res.status).toBe(200)
      expect(res.body.data.length).toBe(1)
      expect(res.body.data[0].name).toBe('Galeno Argentina')
    })

    it('debe filtrar correctamente por insurerType', async () => {
      const res = await request(app)
        .get('/api/health-insurers?insurerType=PREPAID')
        .set('Cookie', authCookie)

      expect(res.status).toBe(200)
      for (const item of res.body.data) {
        expect(item.insurerType).toBe('PREPAID')
      }
    })

    it('no debe incluir obras sociales de otra company', async () => {
      const res = await request(app)
        .get('/api/health-insurers')
        .set('Cookie', authCookie)

      const ids = res.body.data.map((h: { id: string }) => h.id)
      expect(ids).not.toContain(otherCompanyInsurerId)
    })
  })

  describe('GET /api/health-insurers/:id', () => {
    it('debe retornar 404 para una obra social de otra company', async () => {
      const res = await request(app)
        .get(`/api/health-insurers/${otherCompanyInsurerId}`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(404)
    })

    it('debe retornar el detalle de la obra social propia con operativeNotes (200)', async () => {
      const res = await request(app)
        .get(`/api/health-insurers/${createdInsurerId}`)
        .set('Cookie', authCookie)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.name).toBe('Galeno Argentina')
      expect(res.body.data.operativeNotes).toBe('Portal: prestadores.galeno.com.ar\nAutorización online.')
    })
  })

  describe('PUT /api/health-insurers/:id', () => {
    it('debe retornar 404 al intentar actualizar una obra social de otra company', async () => {
      const res = await request(app)
        .put(`/api/health-insurers/${otherCompanyInsurerId}`)
        .set('Cookie', authCookie)
        .send({ name: 'Swiss Medical Modificado' })
      expect(res.status).toBe(404)
    })

    it('debe actualizar los datos de la obra social correctamente', async () => {
      const res = await request(app)
        .put(`/api/health-insurers/${createdInsurerId}`)
        .set('Cookie', authCookie)
        .send({
          operativeNotes: 'Normas actualizadas a 2026',
          active:         false,
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.operativeNotes).toBe('Normas actualizadas a 2026')
      expect(res.body.data.active).toBe(false)
    })
  })

  describe('DELETE /api/health-insurers/:id', () => {
    it('debe retornar 404 al intentar eliminar una obra social de otra company', async () => {
      const res = await request(app)
        .delete(`/api/health-insurers/${otherCompanyInsurerId}`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(404)
    })

    it('debe realizar soft delete de la obra social (204)', async () => {
      const res = await request(app)
        .delete(`/api/health-insurers/${createdInsurerId}`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(204)

      // Verificar que no se puede obtener por ID
      const getRes = await request(app)
        .get(`/api/health-insurers/${createdInsurerId}`)
        .set('Cookie', authCookie)
      expect(getRes.status).toBe(404)

      // Verificar que no aparece en el listado
      const listRes = await request(app)
        .get('/api/health-insurers')
        .set('Cookie', authCookie)
      const ids = listRes.body.data.map((h: { id: string }) => h.id)
      expect(ids).not.toContain(createdInsurerId)
    })
  })
})
