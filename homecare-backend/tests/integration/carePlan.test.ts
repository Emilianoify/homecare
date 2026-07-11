import { describe, it, expect, afterAll, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../../src/main.js'
import { prisma, disconnectDatabase } from '../../src/infrastructure/database/prismaClient.js'

let authCookie: string
let testPatientId: string
let testDoctorId: string
let testInsurerId: string
let testInternmentId: string
let testAuthId: string
const branchId = 'aaaaaaaa-0000-4000-a000-000000000001'
const nonExistentId = 'aaaaaaaa-0000-4000-a000-000000000099'

beforeAll(async () => {
  // Log in using environment variables loaded by app/dotenv
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email:    process.env['SEED_ADMIN_EMAIL'] || 'admin@homecare.com',
      password: process.env['SEED_ADMIN_PASSWORD'] || 'Admin123!'
    })
  
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

describe('CarePlan Endpoints Integration Tests', () => {
  const patientDni = '35881477'
  const professionalCuit = '27-35881477-9'
  const insurerCuit = '30-35881477-9'
  let createdCarePlanId: string

  beforeAll(async () => {
    // 1. Clean up stale records from previous runs
    await prisma.carePlan.deleteMany({
      where: {
        internment: {
          patient: { dni: patientDni }
        }
      }
    })
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
        lastName:      'García Planes',
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
        lastName:              'Sosa Planes',
        firstName:             'Juan',
        dni:                   '35881478',
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
        name:        'Obra Social Planes',
        acronym:     'OSP',
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

    // 5. Create an authorization
    const auth = await prisma.authorization.create({
      data: {
        internmentId:    testInternmentId,
        healthInsurerId: testInsurerId,
        number:          'AUT-CARE-001',
        type:            'INITIAL',
        validFrom:       new Date('2026-05-12'),
        validTo:         new Date('2026-08-12'),
        authorizedModules: ['MEDICINE', 'NURSING']
      }
    })
    testAuthId = auth.id
  })

  describe('POST /api/internments/:internmentId/care-plans', () => {
    it('debe retornar 401 si no está autenticado', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/care-plans`)
        .send({
          professionalId:  testDoctorId,
          authorizationId: testAuthId,
          specialty:       'MEDICINE',
          frequency:       'WEEKLY',
          weekDays:        [3],
          startDate:       '2026-05-12'
        })
      expect(res.status).toBe(401)
    })

    it('debe crear correctamente un plan de atención (201)', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/care-plans`)
        .set('Cookie', authCookie)
        .send({
          professionalId:  testDoctorId,
          authorizationId: testAuthId,
          specialty:       'MEDICINE',
          frequency:       'WEEKLY',
          weekDays:        [3],
          startDate:       '2026-05-12'
        })
      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.active).toBe(true)
      expect(res.body.data.specialty).toBe('MEDICINE')
      expect(res.body.data.weekDays).toEqual([3])
      createdCarePlanId = res.body.data.id
    })

    it('debe retornar 409 si se intenta crear otro plan activo para el mismo profesional + especialidad', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/care-plans`)
        .set('Cookie', authCookie)
        .send({
          professionalId:  testDoctorId,
          specialty:       'MEDICINE',
          frequency:       'DAILY',
          startDate:       '2026-06-01'
        })
      expect(res.status).toBe(409)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toBe('Ya existe un plan activo para este profesional y especialidad en esta internación')
    })

    it('debe retornar 404 si el profesional no existe', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/care-plans`)
        .set('Cookie', authCookie)
        .send({
          professionalId:  nonExistentId,
          specialty:       'MEDICINE',
          frequency:       'WEEKLY',
          startDate:       '2026-05-12'
        })
      expect(res.status).toBe(404)
    })
  })

  describe('GET /api/internments/:internmentId/care-plans', () => {
    it('debe listar todos los planes de atención de la internación', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/care-plans`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.length).toBe(1)
    })

    it('debe permitir filtrar por active=true', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/care-plans?active=true`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(200)
      expect(res.body.data.length).toBe(1)
    })

    it('debe permitir filtrar por active=false', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/care-plans?active=false`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(200)
      expect(res.body.data.length).toBe(0)
    })

    it('debe retornar 404 para internación inexistente', async () => {
      const res = await request(app)
        .get(`/api/internments/${nonExistentId}/care-plans`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(404)
    })
  })

  describe('GET /api/internments/:internmentId/care-plans/:carePlanId', () => {
    it('debe retornar el detalle del plan de atención', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/care-plans/${createdCarePlanId}`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBe(createdCarePlanId)
    })

    it('debe retornar 404 si el plan de atención no existe', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/care-plans/${nonExistentId}`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(404)
    })
  })

  describe('PATCH /api/internments/:internmentId/care-plans/:carePlanId/deactivate', () => {
    it('debe desactivar correctamente el plan de atención (200)', async () => {
      const res = await request(app)
        .patch(`/api/internments/${testInternmentId}/care-plans/${createdCarePlanId}/deactivate`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.active).toBe(false)
    })

    it('debe retornar 409 si el plan de atención ya está inactivo al intentar desactivar de nuevo', async () => {
      const res = await request(app)
        .patch(`/api/internments/${testInternmentId}/care-plans/${createdCarePlanId}/deactivate`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(409)
      expect(res.body.message).toBe('El plan de atención ya está inactivo')
    })

    it('debe permitir crear un nuevo plan para el mismo profesional + especialidad después de desactivar el anterior', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/care-plans`)
        .set('Cookie', authCookie)
        .send({
          professionalId:  testDoctorId,
          specialty:       'MEDICINE',
          frequency:       'DAILY',
          startDate:       '2026-07-01'
        })
      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.active).toBe(true)
    })
  })

  describe('PUT y DELETE no permitidos', () => {
    it('PUT debe retornar 404', async () => {
      const res = await request(app)
        .put(`/api/internments/${testInternmentId}/care-plans/${createdCarePlanId}`)
        .set('Cookie', authCookie)
        .send({ frequency: 'MONTHLY' })
      expect(res.status).toBe(404)
    })

    it('DELETE debe retornar 404', async () => {
      const res = await request(app)
        .delete(`/api/internments/${testInternmentId}/care-plans/${createdCarePlanId}`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(404)
    })
  })
})
