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
const nonExistentId = 'aaaaaaaa-0000-4000-a000-000000000099'

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

describe('Authorization Endpoints Integration Tests', () => {
  const patientDni = '35881467'
  const professionalCuit = '27-35881467-9'
  const insurerCuit = '30-35881467-9'
  let createdAuthId: string

  beforeAll(async () => {
    // 1. Clean up stale records from previous runs
    await prisma.authorization.deleteMany({
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
        lastName:      'García Autorizaciones',
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
        lastName:              'Sosa Autorizaciones',
        firstName:             'Juan',
        dni:                   '35881468',
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
        name:        'Obra Social Autorizaciones',
        acronym:     'OSA',
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

  describe('POST /api/internments/:internmentId/authorizations', () => {
    it('debe retornar 401 si no está autenticado', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/authorizations`)
        .send({
          healthInsurerId:   testInsurerId,
          number:            'AUT-2026-0001',
          type:              'INITIAL',
          validFrom:         '2026-05-12',
          validTo:           '2026-08-12',
          authorizedModules: ['MEDICINE', 'NURSING']
        })
      expect(res.status).toBe(401)
    })

    it('debe crear correctamente una autorización (201)', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/authorizations`)
        .set('Cookie', authCookie)
        .send({
          healthInsurerId:   testInsurerId,
          number:            'AUT-2026-0001',
          type:              'INITIAL',
          validFrom:         '2026-05-12',
          validTo:           '2026-08-12',
          authorizedModules: ['MEDICINE', 'NURSING'],
          notes:             'Autorización inicial de prueba'
        })
      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.number).toBe('AUT-2026-0001')
      expect(res.body.data.status).toBe('PENDING')
      expect(res.body.data.authorizedModules).toEqual(['MEDICINE', 'NURSING'])
      createdAuthId = res.body.data.id
    })

    it('debe retornar 400 si los módulos autorizados están vacíos', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/authorizations`)
        .set('Cookie', authCookie)
        .send({
          healthInsurerId:   testInsurerId,
          number:            'AUT-2026-0002',
          type:              'INITIAL',
          validFrom:         '2026-05-12',
          validTo:           '2026-08-12',
          authorizedModules: []
        })
      expect(res.status).toBe(400)
    })

    it('debe retornar 404 si la internación no existe', async () => {
      const res = await request(app)
        .post(`/api/internments/${nonExistentId}/authorizations`)
        .set('Cookie', authCookie)
        .send({
          healthInsurerId:   testInsurerId,
          number:            'AUT-2026-0003',
          type:              'INITIAL',
          validFrom:         '2026-05-12',
          validTo:           '2026-08-12',
          authorizedModules: ['MEDICINE']
        })
      expect(res.status).toBe(404)
    })
  })

  describe('GET /api/internments/:internmentId/authorizations', () => {
    it('debe listar todas las autorizaciones de la internación', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/authorizations`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.length).toBe(1)
    })

    it('debe retornar 404 para internación inexistente', async () => {
      const res = await request(app)
        .get(`/api/internments/${nonExistentId}/authorizations`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(404)
    })
  })

  describe('GET /api/internments/:internmentId/authorizations/:authorizationId', () => {
    it('debe retornar el detalle de la autorización', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/authorizations/${createdAuthId}`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBe(createdAuthId)
    })

    it('debe retornar 404 para autorización inexistente', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/authorizations/${nonExistentId}`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(404)
    })
  })

  describe('PATCH /api/internments/:internmentId/authorizations/:authorizationId/status', () => {
    it('debe actualizar el estado a APPROVED (200)', async () => {
      const res = await request(app)
        .patch(`/api/internments/${testInternmentId}/authorizations/${createdAuthId}/status`)
        .set('Cookie', authCookie)
        .send({ status: 'APPROVED' })
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.status).toBe('APPROVED')
    })

    it('debe actualizar el estado a REJECTED (200)', async () => {
      const res = await request(app)
        .patch(`/api/internments/${testInternmentId}/authorizations/${createdAuthId}/status`)
        .set('Cookie', authCookie)
        .send({ status: 'REJECTED' })
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.status).toBe('REJECTED')
    })

    it('debe retornar 400 si el estado es inválido', async () => {
      const res = await request(app)
        .patch(`/api/internments/${testInternmentId}/authorizations/${createdAuthId}/status`)
        .set('Cookie', authCookie)
        .send({ status: 'INVALID_STATUS' })
      expect(res.status).toBe(400)
    })
  })

  describe('PUT y DELETE no permitidos', () => {
    it('PUT debe retornar 404', async () => {
      const res = await request(app)
        .put(`/api/internments/${testInternmentId}/authorizations/${createdAuthId}`)
        .set('Cookie', authCookie)
        .send({ number: 'NEW-NUM-123' })
      expect(res.status).toBe(404)
    })

    it('DELETE debe retornar 404', async () => {
      const res = await request(app)
        .delete(`/api/internments/${testInternmentId}/authorizations/${createdAuthId}`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(404)
    })
  })
})
