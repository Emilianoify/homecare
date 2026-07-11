import { describe, it, expect, afterAll, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../../src/main.js'
import { prisma, disconnectDatabase } from '../../src/infrastructure/database/prismaClient.js'

let authCookie: string
let companyId: string
const branchId = 'aaaaaaaa-0000-4000-a000-000000000001'
let testPatientId: string
const nonExistentId = 'aaaaaaaa-0000-4000-a000-000000000000'

beforeAll(async () => {
  // Log in as the seeded admin to get the session cookie
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

  // Get company ID from the seeded branch
  const branch = await prisma.branch.findUnique({
    where: { id: branchId }
  })
  if (!branch) {
    throw new Error('Seeded branch not found')
  }
  companyId = branch.companyId

  // Clean up any old test patient or contacts
  await prisma.patientContact.deleteMany({
    where: {
      patient: { dni: '99999999' }
    }
  })
  await prisma.patient.deleteMany({
    where: { dni: '99999999' }
  })

  // Create a patient for testing contacts
  const patient = await prisma.patient.create({
    data: {
      companyId,
      branchId,
      lastName: 'TestContact',
      firstName: 'Patient',
      dni: '99999999',
      dateOfBirth: new Date('1990-01-01'),
      biologicalSex: 'MALE',
      vatCondition: 'FINAL_CONSUMER',
      careAddress: 'Calle Falsa 123',
      careCity: 'La Plata',
      careProvince: 'Buenos Aires',
      phone: '1234567890',
    }
  })
  testPatientId = patient.id
})

afterAll(async () => {
  // Clean up patient and contact records
  if (testPatientId) {
    await prisma.patientContact.deleteMany({
      where: { patientId: testPatientId }
    })
    await prisma.patient.delete({
      where: { id: testPatientId }
    }).catch(() => {})
  }
  await disconnectDatabase()
})

describe('PatientContact Endpoints Integration Tests', () => {
  let contact1Id: string
  let contact2Id: string

  it('GET /api/patients/:patientId/contacts - 401 sin cookie', async () => {
    const res = await request(app)
      .get(`/api/patients/${testPatientId}/contacts`)
    expect(res.status).toBe(401)
  })

  it('GET /api/patients/:patientId/contacts - 404 con paciente inexistente', async () => {
    const res = await request(app)
      .get(`/api/patients/${nonExistentId}/contacts`)
      .set('Cookie', authCookie)
    expect(res.status).toBe(404)
  })

  it('POST /api/patients/:patientId/contacts - 401 sin cookie', async () => {
    const res = await request(app)
      .post(`/api/patients/${testPatientId}/contacts`)
      .send({
        name: 'Juan Perez',
        relationship: 'Hijo',
        phone: '1122334455',
        isPrimary: true,
      })
    expect(res.status).toBe(401)
  })

  it('POST /api/patients/:patientId/contacts - 404 con paciente inexistente', async () => {
    const res = await request(app)
      .post(`/api/patients/${nonExistentId}/contacts`)
      .set('Cookie', authCookie)
      .send({
        name: 'Juan Perez',
        relationship: 'Hijo',
        phone: '1122334455',
        isPrimary: true,
      })
    expect(res.status).toBe(404)
  })

  it('POST /api/patients/:patientId/contacts - 400 body inválido', async () => {
    const res = await request(app)
      .post(`/api/patients/${testPatientId}/contacts`)
      .set('Cookie', authCookie)
      .send({
        name: 'J', // too short
        relationship: 'Hijo',
        phone: '1122334455',
      })
    expect(res.status).toBe(400)
  })

  it('POST /api/patients/:patientId/contacts - 201 crea primer contacto (primary)', async () => {
    const res = await request(app)
      .post(`/api/patients/${testPatientId}/contacts`)
      .set('Cookie', authCookie)
      .send({
        name: 'Juan Perez',
        relationship: 'Hijo',
        phone: '1122334455',
        isPrimary: true,
      })
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.id).toBeDefined()
    expect(res.body.data.isPrimary).toBe(true)
    contact1Id = res.body.data.id as string
  })

  it('POST /api/patients/:patientId/contacts - 201 crea segundo contacto (primary) y limpia el anterior', async () => {
    const res = await request(app)
      .post(`/api/patients/${testPatientId}/contacts`)
      .set('Cookie', authCookie)
      .send({
        name: 'Maria Perez',
        relationship: 'Hija',
        phone: '9988776655',
        isPrimary: true,
      })
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.isPrimary).toBe(true)
    contact2Id = res.body.data.id as string

    // Verify contact 1 is no longer primary
    const c1 = await prisma.patientContact.findUnique({
      where: { id: contact1Id }
    })
    expect(c1?.isPrimary).toBe(false)
  })

  it('GET /api/patients/:patientId/contacts - devuelve ordenados con primary primero', async () => {
    const res = await request(app)
      .get(`/api/patients/${testPatientId}/contacts`)
      .set('Cookie', authCookie)
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(2)
    // Contact 2 is primary, contact 1 is not. Contact 2 must be first.
    expect(res.body.data[0].id).toBe(contact2Id)
    expect(res.body.data[0].isPrimary).toBe(true)
    expect(res.body.data[1].id).toBe(contact1Id)
    expect(res.body.data[1].isPrimary).toBe(false)
  })

  it('PUT /api/patients/:patientId/contacts/:contactId - 404 id inexistente', async () => {
    const res = await request(app)
      .put(`/api/patients/${testPatientId}/contacts/${nonExistentId}`)
      .set('Cookie', authCookie)
      .send({
        name: 'Maria Actualizada',
      })
    expect(res.status).toBe(404)
  })

  it('PUT /api/patients/:patientId/contacts/:contactId - 200 actualiza campos correctamente', async () => {
    const res = await request(app)
      .put(`/api/patients/${testPatientId}/contacts/${contact2Id}`)
      .set('Cookie', authCookie)
      .send({
        name: 'Maria Gomez',
      })
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.name).toBe('Maria Gomez')
  })

  it('PUT /api/patients/:patientId/contacts/:contactId - actualiza a primary y limpia anterior', async () => {
    // Current primary is contact 2. Make contact 1 primary.
    const res = await request(app)
      .put(`/api/patients/${testPatientId}/contacts/${contact1Id}`)
      .set('Cookie', authCookie)
      .send({
        isPrimary: true,
      })
    expect(res.status).toBe(200)
    expect(res.body.data.isPrimary).toBe(true)

    // Verify contact 2 is no longer primary
    const c2 = await prisma.patientContact.findUnique({
      where: { id: contact2Id }
    })
    expect(c2?.isPrimary).toBe(false)
  })

  it('DELETE /api/patients/:patientId/contacts/:contactId - 404 id inexistente', async () => {
    const res = await request(app)
      .delete(`/api/patients/${testPatientId}/contacts/${nonExistentId}`)
      .set('Cookie', authCookie)
    expect(res.status).toBe(404)
  })

  it('DELETE /api/patients/:patientId/contacts/:contactId - 204 y remoción física', async () => {
    const res = await request(app)
      .delete(`/api/patients/${testPatientId}/contacts/${contact1Id}`)
      .set('Cookie', authCookie)
    expect(res.status).toBe(204)

    // Verify contact 1 is deleted physically (should be null, as there is no soft delete)
    const c1 = await prisma.patientContact.findUnique({
      where: { id: contact1Id }
    })
    expect(c1).toBeNull()
  })

  it('GET /api/patients/:patientId/contacts - lista no incluye el contacto eliminado', async () => {
    const res = await request(app)
      .get(`/api/patients/${testPatientId}/contacts`)
      .set('Cookie', authCookie)
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].id).toBe(contact2Id)
  })
})
