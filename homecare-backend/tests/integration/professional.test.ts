import { describe, it, expect, afterAll, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../../src/main.js'
import { prisma, disconnectDatabase } from '../../src/infrastructure/database/prismaClient.js'

let authCookie: string

beforeAll(async () => {
  // Log in as the seeded admin to get the session cookie
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@homecare.com', password: 'Admin123!' })
  
  const cookies = res.headers['set-cookie'] as unknown as string[] | undefined
  if (cookies) {
    // Find the access_token cookie
    const tokenCookie = cookies.find(c => c.startsWith('access_token='))
    if (tokenCookie) {
      authCookie = tokenCookie.split(';')[0]!
    }
  }
})

afterAll(async () => {
  await disconnectDatabase()
})

describe('Professional Endpoints Integration Tests', () => {
  let createdProfessionalId: string
  const professionalCuit = '27-31881440-9'
  const alternativeCuit = '27-31881440-8'

  beforeAll(async () => {
    // Clean up test professionals with these CUITs to ensure fresh start
    await prisma.professional.deleteMany({
      where: {
        cuit: { in: [professionalCuit, alternativeCuit] }
      }
    })
  })

  afterAll(async () => {
    // Clean up test professionals with these CUITs
    await prisma.professional.deleteMany({
      where: {
        cuit: { in: [professionalCuit, alternativeCuit] }
      }
    })
  })

  it('POST /api/professionals - 401 sin cookie', async () => {
    const res = await request(app)
      .post('/api/professionals')
      .send({
        lastName: 'Fernández',
        firstName: 'Laura',
        dni: '31881440',
        cuit: professionalCuit,
        vatCondition: 'MONOTAX',
        specialty: 'NURSING',
        provincialLicense: 'MP 44821',
        licenseProvince: 'Buenos Aires',
        licenseExpiresAt: '2027-12-31',
        contractType: 'MONOTAX',
        cbu: '0140099503605888001936',
        coverageZones: ['La Plata', 'Berisso'],
        availableForEmergency: false,
        hasOwnVehicle: true,
        phone: '02214321890',
      })
    expect(res.status).toBe(401)
  })

  it('POST /api/professionals - 201 crea correctamente', async () => {
    const res = await request(app)
      .post('/api/professionals')
      .set('Cookie', authCookie)
      .send({
        lastName: 'Fernández',
        firstName: 'Laura',
        dni: '31881440',
        cuit: professionalCuit,
        vatCondition: 'MONOTAX',
        specialty: 'NURSING',
        provincialLicense: 'MP 44821',
        licenseProvince: 'Buenos Aires',
        licenseExpiresAt: '2027-12-31',
        contractType: 'MONOTAX',
        cbu: '0140099503605888001936',
        coverageZones: ['La Plata', 'Berisso'],
        availableForEmergency: false,
        hasOwnVehicle: true,
        phone: '02214321890',
      })
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.id).toBeDefined()
    expect(res.body.data.fullName).toBe('Fernández, Laura')
    expect(res.body.data.cbu).toBeUndefined() // List/Response DTO shouldn't contain cbu
    createdProfessionalId = res.body.data.id
  })

  it('POST /api/professionals - 409 CUIT duplicado', async () => {
    const res = await request(app)
      .post('/api/professionals')
      .set('Cookie', authCookie)
      .send({
        lastName: 'Fernández Ruedas',
        firstName: 'Laura Inés',
        dni: '31881441',
        cuit: professionalCuit, // duplicate cuit
        vatCondition: 'MONOTAX',
        specialty: 'NURSING',
        contractType: 'MONOTAX',
        cbu: '0140099503605888001936',
        phone: '02214321890',
      })
    expect(res.status).toBe(409)
    expect(res.body.success).toBe(false)
  })

  it('POST /api/professionals - 400 body inválido (cuit inválido)', async () => {
    const res = await request(app)
      .post('/api/professionals')
      .set('Cookie', authCookie)
      .send({
        lastName: 'Fernández',
        firstName: 'Laura',
        dni: '31881440',
        cuit: '123', // invalid format
        vatCondition: 'MONOTAX',
        specialty: 'NURSING',
        contractType: 'MONOTAX',
        cbu: '0140099503605888001936',
        phone: '02214321890',
      })
    expect(res.status).toBe(400)
  })

  it('POST /api/professionals - 400 body inválido (cbu corto)', async () => {
    const res = await request(app)
      .post('/api/professionals')
      .set('Cookie', authCookie)
      .send({
        lastName: 'Fernández',
        firstName: 'Laura',
        dni: '31881440',
        cuit: '27-31881440-9',
        vatCondition: 'MONOTAX',
        specialty: 'NURSING',
        contractType: 'MONOTAX',
        cbu: '12345', // cbu must be exactly 22 chars
        phone: '02214321890',
      })
    expect(res.status).toBe(400)
  })

  it('GET /api/professionals - 200 devuelve lista paginada', async () => {
    const res = await request(app)
      .get('/api/professionals')
      .set('Cookie', authCookie)
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toBeDefined()
    expect(Array.isArray(res.body.data)).toBe(true)
    // Make sure CBU is not exposed in list output
    if (res.body.data.length > 0) {
      expect(res.body.data[0].cbu).toBeUndefined()
    }
  })

  it('GET /api/professionals?search=Fernández - 200 filtra correctamente', async () => {
    const res = await request(app)
      .get('/api/professionals?search=Fernández')
      .set('Cookie', authCookie)
    expect(res.status).toBe(200)
    expect(res.body.data.length).toBeGreaterThanOrEqual(1)
    expect(res.body.data[0].lastName).toContain('Fernández')
  })

  it('GET /api/professionals?specialty=NURSING - 200 filtra correctamente', async () => {
    const res = await request(app)
      .get('/api/professionals?specialty=NURSING')
      .set('Cookie', authCookie)
    expect(res.status).toBe(200)
    expect(res.body.data.length).toBeGreaterThanOrEqual(1)
    expect(res.body.data.every((p: any) => p.specialty === 'NURSING')).toBe(true)
  })

  it('GET /api/professionals?active=true - 200 filtra correctamente', async () => {
    const res = await request(app)
      .get('/api/professionals?active=true')
      .set('Cookie', authCookie)
    expect(res.status).toBe(200)
    expect(res.body.data.every((p: any) => p.active === true)).toBe(true)
  })

  it('GET /api/professionals/:id - 200 devuelve detalle con cbu', async () => {
    const res = await request(app)
      .get(`/api/professionals/${createdProfessionalId}`)
      .set('Cookie', authCookie)
    expect(res.status).toBe(200)
    expect(res.body.data.fullName).toBe('Fernández, Laura')
    expect(res.body.data.id).toBe(createdProfessionalId)
    expect(res.body.data.cbu).toBe('0140099503605888001936') // Detail must include CBU
  })

  it('GET /api/professionals/:id - 404 con ID inexistente', async () => {
    const res = await request(app)
      .get('/api/professionals/aaaaaaaa-0000-4000-a000-000000000000')
      .set('Cookie', authCookie)
    expect(res.status).toBe(404)
  })

  it('PUT /api/professionals/:id - 200 actualiza correctamente', async () => {
    const res = await request(app)
      .put(`/api/professionals/${createdProfessionalId}`)
      .set('Cookie', authCookie)
      .send({
        firstName: 'Laura Inés',
      })
    expect(res.status).toBe(200)
    expect(res.body.data.firstName).toBe('Laura Inés')
    expect(res.body.data.fullName).toBe('Fernández, Laura Inés')
  })

  it('PUT /api/professionals/:id - 409 cambiando CUIT a uno ya existente', async () => {
    // Create another professional to collide with
    const otherRes = await request(app)
      .post('/api/professionals')
      .set('Cookie', authCookie)
      .send({
        lastName: 'Gómez',
        firstName: 'Carlos',
        dni: '30881440',
        cuit: alternativeCuit,
        vatCondition: 'MONOTAX',
        specialty: 'MEDICINE',
        contractType: 'MONOTAX',
        cbu: '0140099503605888001937',
        phone: '02214321891',
      })
    expect(otherRes.status).toBe(201)

    // Attempt to update our first professional with the second one's CUIT
    const res = await request(app)
      .put(`/api/professionals/${createdProfessionalId}`)
      .set('Cookie', authCookie)
      .send({
        cuit: alternativeCuit,
      })
    expect(res.status).toBe(409)
  })

  it('DELETE /api/professionals/:id - 204', async () => {
    const res = await request(app)
      .delete(`/api/professionals/${createdProfessionalId}`)
      .set('Cookie', authCookie)
    expect(res.status).toBe(204)
  })

  it('GET /api/professionals/:id - 404 después de eliminar', async () => {
    const res = await request(app)
      .get(`/api/professionals/${createdProfessionalId}`)
      .set('Cookie', authCookie)
    expect(res.status).toBe(404)
  })

  it('GET /api/professionals - no incluye el profesional eliminado', async () => {
    const res = await request(app)
      .get('/api/professionals')
      .set('Cookie', authCookie)
    const found = res.body.data.find((p: any) => p.id === createdProfessionalId)
    expect(found).toBeUndefined()
  })
})
