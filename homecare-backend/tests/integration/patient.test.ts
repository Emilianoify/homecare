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

describe('Patient Endpoints Integration Tests', () => {
  let createdPatientId: string
  const patientDni = '24881440'

  beforeAll(async () => {
    // Clean up test patient with this DNI to ensure fresh start
    await prisma.patient.deleteMany({ where: { dni: patientDni } })
  })

  afterAll(async () => {
    // Clean up test patient with this DNI
    await prisma.patient.deleteMany({ where: { dni: patientDni } })
  })

  it('POST /api/patients - 401 sin cookie', async () => {
    const res = await request(app)
      .post('/api/patients')
      .send({
        branchId: 'aaaaaaaa-0000-4000-a000-000000000001',
        lastName: 'García',
        firstName: 'Luis',
        dni: patientDni,
        dateOfBirth: '1966-03-14',
        biologicalSex: 'MALE',
        vatCondition: 'FINAL_CONSUMER',
        careAddress: 'Av. Centenario 1420',
        careCity: 'La Plata',
        careProvince: 'Buenos Aires',
        phone: '02214881440',
      })
    expect(res.status).toBe(401)
  })

  it('POST /api/patients - 201 crea correctamente', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Cookie', authCookie)
      .send({
        branchId: 'aaaaaaaa-0000-4000-a000-000000000001',
        lastName: 'García',
        firstName: 'Luis',
        dni: patientDni,
        dateOfBirth: '1966-03-14',
        biologicalSex: 'MALE',
        vatCondition: 'FINAL_CONSUMER',
        careAddress: 'Av. Centenario 1420',
        careCity: 'La Plata',
        careProvince: 'Buenos Aires',
        phone: '02214881440',
      })
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.id).toBeDefined()
    expect(res.body.data.fullName).toBe('García, Luis')
    createdPatientId = res.body.data.id as string
  })

  it('POST /api/patients - 409 DNI duplicado', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Cookie', authCookie)
      .send({
        branchId: 'aaaaaaaa-0000-4000-a000-000000000001',
        lastName: 'García Ruedas',
        firstName: 'Luis Miguel',
        dni: patientDni,
        dateOfBirth: '1980-05-15',
        biologicalSex: 'MALE',
        vatCondition: 'FINAL_CONSUMER',
        careAddress: 'Av. 7 420',
        careCity: 'La Plata',
        careProvince: 'Buenos Aires',
        phone: '02214881440',
      })
    expect(res.status).toBe(409)
    expect(res.body.success).toBe(false)
  })

  it('POST /api/patients - 400 body inválido (DNI corto)', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Cookie', authCookie)
      .send({
        branchId: 'aaaaaaaa-0000-4000-a000-000000000001',
        lastName: 'García',
        firstName: 'Luis',
        dni: '123', // invalid DNI
        dateOfBirth: '1966-03-14',
        biologicalSex: 'MALE',
        vatCondition: 'FINAL_CONSUMER',
        careAddress: 'Av. Centenario 1420',
        careCity: 'La Plata',
        careProvince: 'Buenos Aires',
        phone: '02214881440',
      })
    expect(res.status).toBe(400)
  })

  it('GET /api/patients - 200 devuelve lista paginada', async () => {
    const res = await request(app)
      .get('/api/patients')
      .set('Cookie', authCookie)
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toBeDefined()
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.meta).toBeDefined()
    expect(res.body.meta.page).toBe(1)
  })

  it('GET /api/patients?search=García - 200 filtra correctamente', async () => {
    const res = await request(app)
      .get('/api/patients?search=García')
      .set('Cookie', authCookie)
    expect(res.status).toBe(200)
    expect(res.body.data.length).toBeGreaterThanOrEqual(1)
    expect(res.body.data[0].lastName).toContain('García')
  })

  it('GET /api/patients/:id - 200 devuelve detalle con fullName', async () => {
    const res = await request(app)
      .get(`/api/patients/${createdPatientId}`)
      .set('Cookie', authCookie)
    expect(res.status).toBe(200)
    expect(res.body.data.fullName).toBe('García, Luis')
    expect(res.body.data.id).toBe(createdPatientId)
  })

  it('GET /api/patients/:id - 404 con ID inexistente', async () => {
    const res = await request(app)
      .get('/api/patients/aaaaaaaa-0000-4000-a000-000000000000')
      .set('Cookie', authCookie)
    expect(res.status).toBe(404)
  })

  it('PUT /api/patients/:id - 200 actualiza correctamente', async () => {
    const res = await request(app)
      .put(`/api/patients/${createdPatientId}`)
      .set('Cookie', authCookie)
      .send({
        firstName: 'Luis Alberto',
      })
    expect(res.status).toBe(200)
    expect(res.body.data.firstName).toBe('Luis Alberto')
    expect(res.body.data.fullName).toBe('García, Luis Alberto')
  })

  it('DELETE /api/patients/:id - 204', async () => {
    const res = await request(app)
      .delete(`/api/patients/${createdPatientId}`)
      .set('Cookie', authCookie)
    expect(res.status).toBe(204)
  })

  it('GET /api/patients/:id - 404 después de eliminar', async () => {
    const res = await request(app)
      .get(`/api/patients/${createdPatientId}`)
      .set('Cookie', authCookie)
    expect(res.status).toBe(404)
  })

  it('GET /api/patients - no incluye el paciente eliminado', async () => {
    const res = await request(app)
      .get('/api/patients')
      .set('Cookie', authCookie)
    const found = res.body.data.find((p: any) => p.id === createdPatientId)
    expect(found).toBeUndefined()
  })
})
