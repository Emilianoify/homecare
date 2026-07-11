import { describe, it, expect, afterAll, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../../src/main.js'
import { prisma, disconnectDatabase } from '../../src/infrastructure/database/prismaClient.js'

let authCookie: string
let companyId: string
let iomaId: string
let med01Id: string
let psi01Id: string
const nonExistentId = 'aaaaaaaa-0000-4000-a000-000000000000'

describe('InsurerRate Endpoints Integration Tests', () => {
  let createdRateId: string
  let otherCompanyInsurerId: string
  let otherCompanyId: string

  beforeAll(async () => {
    // Clean up any leaked test data from previous runs
    await prisma.healthInsurer.deleteMany({ where: { cuit: '30-57411047-9' } })
    await prisma.company.deleteMany({ where: { cuit: '33-99999997-9' } })

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

    // 2. Retrieve admin's companyId
    const company = await prisma.company.findFirst()
    if (!company) throw new Error('No company found in database')
    companyId = company.id

    // 3. Find IOMA and serviceItems from seed
    const ioma = await prisma.healthInsurer.findFirst({
      where: { companyId, acronym: 'IOMA' }
    })
    if (!ioma) throw new Error('IOMA not found in seed')
    iomaId = ioma.id

    const med01 = await prisma.serviceItem.findFirst({ where: { code: 'MED-01' } })
    if (!med01) throw new Error('MED-01 not found in seed')
    med01Id = med01.id

    const psi01 = await prisma.serviceItem.findFirst({ where: { code: 'PSI-01' } })
    if (!psi01) throw new Error('PSI-01 not found in seed')
    psi01Id = psi01.id

    // 4. Create another company and a health insurer for it to test isolation
    const otherCompany = await prisma.company.create({
      data: {
        legalName:    'Other Company S.A. Rates',
        cuit:         '33-99999997-9',
        vatCondition: 'REGISTERED_TAXPAYER',
        address:      'Calle 2 123',
        city:         'La Plata',
        province:     'Buenos Aires',
      }
    })
    otherCompanyId = otherCompany.id

    const otherInsurer = await prisma.healthInsurer.create({
      data: {
        companyId:      otherCompanyId,
        name:           'Other Swiss Medical Group',
        acronym:        'OTH-SWISS',
        cuit:           '30-57411047-9',
        insurerType:    'PREPAID',
        billingMode:    'PER_VISIT',
        active:         true,
      }
    })
    otherCompanyInsurerId = otherInsurer.id
  })

  afterAll(async () => {
    // Clean up
    if (createdRateId) {
      await prisma.insurerServiceRate.delete({ where: { id: createdRateId } }).catch(() => {})
    }
    if (otherCompanyInsurerId) {
      await prisma.healthInsurer.delete({ where: { id: otherCompanyInsurerId } }).catch(() => {})
    }
    if (otherCompanyId) {
      await prisma.company.delete({ where: { id: otherCompanyId } }).catch(() => {})
    }

    await disconnectDatabase()
  })

  describe('GET /api/health-insurers/:healthInsurerId/rates', () => {
    it('debe retornar 401 si no hay cookie de autenticación', async () => {
      const res = await request(app)
        .get(`/api/health-insurers/${iomaId}/rates`)
      expect(res.status).toBe(401)
    })

    it('debe listar todas las tarifas de la obra social (200)', async () => {
      const res = await request(app)
        .get(`/api/health-insurers/${iomaId}/rates`)
        .set('Cookie', authCookie)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toBeInstanceOf(Array)
      expect(res.body.data.length).toBeGreaterThanOrEqual(3) // 3 seeded rates
    })

    it('debe retornar 404 si la obra social no existe', async () => {
      const res = await request(app)
        .get(`/api/health-insurers/${nonExistentId}/rates`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(404)
    })

    it('debe retornar 404 si la obra social es de otra company', async () => {
      const res = await request(app)
        .get(`/api/health-insurers/${otherCompanyInsurerId}/rates`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(404)
    })

    it('debe filtrar solo las tarifas activas si onlyActive=true', async () => {
      const res = await request(app)
        .get(`/api/health-insurers/${iomaId}/rates?onlyActive=true`)
        .set('Cookie', authCookie)

      expect(res.status).toBe(200)
      for (const rate of res.body.data) {
        expect(rate.active).toBe(true)
      }
    })
  })

  describe('POST /api/health-insurers/:healthInsurerId/rates', () => {
    it('debe retornar 400 si el body es inválido (precio negativo)', async () => {
      const res = await request(app)
        .post(`/api/health-insurers/${iomaId}/rates`)
        .set('Cookie', authCookie)
        .send({
          serviceItemId: psi01Id,
          agreedPrice:   -100,
          validFrom:     '2025-01-01'
        })
      expect(res.status).toBe(400)
    })

    it('debe retornar 404 si serviceItemId no existe', async () => {
      const res = await request(app)
        .post(`/api/health-insurers/${iomaId}/rates`)
        .set('Cookie', authCookie)
        .send({
          serviceItemId: nonExistentId,
          agreedPrice:   2000,
          validFrom:     '2025-01-01'
        })
      expect(res.status).toBe(404)
    })

    it('debe crear correctamente el arancel (201)', async () => {
      const res = await request(app)
        .post(`/api/health-insurers/${iomaId}/rates`)
        .set('Cookie', authCookie)
        .send({
          serviceItemId: psi01Id,
          agreedPrice:   2200,
          validFrom:     '2025-01-01',
          active:        true
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBeDefined()
      expect(res.body.data.healthInsurerId).toBe(iomaId)
      expect(res.body.data.serviceItemId).toBe(psi01Id)
      expect(res.body.data.agreedPrice).toBe(2200)

      createdRateId = res.body.data.id
    })

    it('debe retornar 409 si ya existe una tarifa con la misma combinación (cuit + service + validFrom)', async () => {
      const res = await request(app)
        .post(`/api/health-insurers/${iomaId}/rates`)
        .set('Cookie', authCookie)
        .send({
          serviceItemId: psi01Id,
          agreedPrice:   3000,
          validFrom:     '2025-01-01'
        })
      expect(res.status).toBe(409)
    })
  })

  describe('PUT /api/health-insurers/:healthInsurerId/rates/:rateId', () => {
    it('debe retornar 404 si el rateId no existe', async () => {
      const res = await request(app)
        .put(`/api/health-insurers/${iomaId}/rates/${nonExistentId}`)
        .set('Cookie', authCookie)
        .send({ agreedPrice: 2500 })
      expect(res.status).toBe(404)
    })

    it('debe actualizar correctamente la tarifa (200)', async () => {
      const res = await request(app)
        .put(`/api/health-insurers/${iomaId}/rates/${createdRateId}`)
        .set('Cookie', authCookie)
        .send({
          validTo: '2025-12-31',
          active:  false
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.validTo).toBe('2025-12-31')
      expect(res.body.data.active).toBe(false)
    })
  })

  describe('DELETE /api/health-insurers/:healthInsurerId/rates/:rateId', () => {
    it('debe retornar 404 al intentar eliminar una tarifa que no existe', async () => {
      const res = await request(app)
        .delete(`/api/health-insurers/${iomaId}/rates/${nonExistentId}`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(404)
    })

    it('debe eliminar la tarifa físicamente (204)', async () => {
      const res = await request(app)
        .delete(`/api/health-insurers/${iomaId}/rates/${createdRateId}`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(204)

      // Verificar que no se puede obtener listado con esa tarifa
      const listRes = await request(app)
        .get(`/api/health-insurers/${iomaId}/rates`)
        .set('Cookie', authCookie)

      const ids = listRes.body.data.map((r: { id: string }) => r.id)
      expect(ids).not.toContain(createdRateId)
      createdRateId = '' // already deleted
    })
  })
})
