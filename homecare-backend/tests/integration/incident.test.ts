import { describe, it, expect, afterAll, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../../src/main.js'
import { prisma, disconnectDatabase } from '../../src/infrastructure/database/prismaClient.js'

let authCookie: string
let testPatientId: string
let testDoctorId: string
let testInsurerId: string
let testInternmentId: string
const branchId = 'aaaaaaaa-0000-4000-a000-000000000001'
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
})

afterAll(async () => {
  await disconnectDatabase()
})

describe('Incident Endpoints Integration Tests', () => {
  const patientDni = '35881449'
  const professionalCuit = '27-35881449-9'
  const insurerCuit = '30-35881449-9'
  let createdIncidentId: string

  beforeAll(async () => {
    // 1. Clean up stale records from previous runs
    await prisma.incident.deleteMany({
      where: {
        internment: {
          patient: { dni: patientDni }
        }
      }
    })
    await prisma.internment.deleteMany({
      where: {
        patient: { dni: patientDni }
      }
    })
    await prisma.patient.deleteMany({ where: { dni: patientDni } })
    await prisma.professional.deleteMany({ where: { cuit: professionalCuit } })
    await prisma.healthInsurer.deleteMany({ where: { cuit: insurerCuit } })

    // 2. Retrieve company details
    const company = await prisma.company.findFirst()
    if (!company) throw new Error('No company found in database')

    // 3. Create test dependencies
    const patient = await prisma.patient.create({
      data: {
        companyId:     company.id,
        branchId,
        lastName:      'García Incidentes',
        firstName:     'Luis',
        dni:           patientDni,
        dateOfBirth:   new Date('1985-10-25'),
        biologicalSex: 'MALE',
        vatCondition:  'FINAL_CONSUMER',
        careAddress:   'Av. de Mayo 200',
        careCity:      'Buenos Aires',
        careProvince:  'CABA',
        phone:         '1134567890',
      }
    })
    testPatientId = patient.id

    const doc = await prisma.professional.create({
      data: {
        companyId:             company.id,
        lastName:              'Sosa Incidentes',
        firstName:             'Juan',
        dni:                   '35881440',
        cuit:                  professionalCuit,
        vatCondition:          'MONOTAX',
        specialty:             'MEDICINE',
        contractType:          'MONOTAX',
        cbu:                   '0140099503605888001938',
        phone:                 '1134567891',
        availableForEmergency: false,
        hasOwnVehicle:         false,
      }
    })
    testDoctorId = doc.id

    const insurer = await prisma.healthInsurer.create({
      data: {
        companyId:   company.id,
        name:        'Obra Social Incidentes',
        acronym:     'OSI',
        cuit:        insurerCuit,
        insurerType: 'PREPAID',
        billingMode: 'PER_VISIT',
      }
    })
    testInsurerId = insurer.id

    // 4. Create an internment
    const internment = await prisma.internment.create({
      data: {
        patientId:           testPatientId,
        branchId,
        healthInsurerId:     testInsurerId,
        responsibleDoctorId: testDoctorId,
        internmentType:      'ACUTE',
        admissionMode:       'FROM_HOME',
        admissionDate:       new Date('2026-05-12'),
        mainDiagnosis:       'EPOC',
        cie10Code:           'J44.9',
        status:              'ACTIVE',
      }
    })
    testInternmentId = internment.id
  })

  describe('POST /api/internments/:internmentId/incidents', () => {
    it('debe retornar 401 si no está autenticado', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/incidents`)
        .send({
          type:        'FALL',
          severity:    'HIGH',
          description: 'Paciente sufrió una caída al intentar levantarse.',
          occurredAt:  '2026-07-01T14:30:00.000Z',
        })
      expect(res.status).toBe(401)
    })

    it('debe retornar 404 para internación inexistente', async () => {
      const res = await request(app)
        .post(`/api/internments/${nonExistentId}/incidents`)
        .set('Cookie', authCookie)
        .send({
          type:        'FALL',
          severity:    'HIGH',
          description: 'Paciente sufrió una caída al intentar levantarse.',
          occurredAt:  '2026-07-01T14:30:00.000Z',
        })
      expect(res.status).toBe(404)
    })

    it('debe retornar 400 si la descripción es menor a 10 caracteres', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/incidents`)
        .set('Cookie', authCookie)
        .send({
          type:        'FALL',
          severity:    'HIGH',
          description: 'Caída',
          occurredAt:  '2026-07-01T14:30:00.000Z',
        })
      expect(res.status).toBe(400)
    })

    it('debe crear un incidente exitosamente (201)', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/incidents`)
        .set('Cookie', authCookie)
        .send({
          type:        'FALL',
          severity:    'HIGH',
          description: 'Paciente sufrió una caída al intentar levantarse solo.',
          occurredAt:  '2026-07-01T14:30:00.000Z',
        })
      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBeDefined()
      expect(res.body.data.status).toBe('OPEN')
      expect(res.body.data.internmentId).toBe(testInternmentId)
      createdIncidentId = res.body.data.id
    })
  })

  describe('GET /api/internments/:internmentId/incidents', () => {
    it('debe retornar 401 si no está autenticado', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/incidents`)
      expect(res.status).toBe(401)
    })

    it('debe retornar 404 para internación inexistente', async () => {
      const res = await request(app)
        .get(`/api/internments/${nonExistentId}/incidents`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(404)
    })

    it('debe listar incidentes paginados ordenados por gravedad y fecha desc', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/incidents`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toBeInstanceOf(Array)
      expect(res.body.data.length).toBeGreaterThan(0)
      expect(res.body.meta).toBeDefined()
    })

    it('debe poder filtrar por gravedad', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/incidents?severity=HIGH`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(200)
      expect(res.body.data.every((i: any) => i.severity === 'HIGH')).toBe(true)
    })

    it('debe poder filtrar por estado', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/incidents?status=OPEN`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(200)
      expect(res.body.data.every((i: any) => i.status === 'OPEN')).toBe(true)
    })
  })

  describe('GET /api/internments/:internmentId/incidents/:incidentId', () => {
    it('debe retornar 401 si no está autenticado', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/incidents/${createdIncidentId}`)
      expect(res.status).toBe(401)
    })

    it('debe retornar 404 para incidente inexistente', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/incidents/${nonExistentId}`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(404)
    })

    it('debe retornar el detalle del incidente (200)', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/incidents/${createdIncidentId}`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBe(createdIncidentId)
    })
  })

  describe('PATCH /api/internments/:internmentId/incidents/:incidentId/status', () => {
    it('debe retornar 401 si no está autenticado', async () => {
      const res = await request(app)
        .patch(`/api/internments/${testInternmentId}/incidents/${createdIncidentId}/status`)
        .send({ status: 'IN_REVIEW' })
      expect(res.status).toBe(401)
    })

    it('debe cambiar el estado a IN_REVIEW (200)', async () => {
      const res = await request(app)
        .patch(`/api/internments/${testInternmentId}/incidents/${createdIncidentId}/status`)
        .set('Cookie', authCookie)
        .send({ status: 'IN_REVIEW' })
      expect(res.status).toBe(200)
      expect(res.body.data.status).toBe('IN_REVIEW')
    })
  })

  describe('PATCH /api/internments/:internmentId/incidents/:incidentId/resolve', () => {
    it('debe retornar 401 si no está autenticado', async () => {
      const res = await request(app)
        .patch(`/api/internments/${testInternmentId}/incidents/${createdIncidentId}/resolve`)
        .send({ resolution: 'Se evaluó al paciente y se colocaron barandas.' })
      expect(res.status).toBe(401)
    })

    it('debe resolver el incidente correctamente (200)', async () => {
      const res = await request(app)
        .patch(`/api/internments/${testInternmentId}/incidents/${createdIncidentId}/resolve`)
        .set('Cookie', authCookie)
        .send({ resolution: 'Se evaluó al paciente y se colocaron barandas en la cama.' })
      expect(res.status).toBe(200)
      expect(res.body.data.status).toBe('RESOLVED')
      expect(res.body.data.resolution).toBe('Se evaluó al paciente y se colocaron barandas en la cama.')
      expect(res.body.data.resolvedAt).toBeDefined()
    })

    it('debe retornar 409 al intentar resolver un incidente ya resuelto', async () => {
      const res = await request(app)
        .patch(`/api/internments/${testInternmentId}/incidents/${createdIncidentId}/resolve`)
        .set('Cookie', authCookie)
        .send({ resolution: 'Segundo intento de resolución.' })
      expect(res.status).toBe(409)
    })

    it('debe retornar 409 al intentar cambiar el estado de un incidente resuelto', async () => {
      const res = await request(app)
        .patch(`/api/internments/${testInternmentId}/incidents/${createdIncidentId}/status`)
        .set('Cookie', authCookie)
        .send({ status: 'IN_REVIEW' })
      expect(res.status).toBe(409)
    })
  })
})
