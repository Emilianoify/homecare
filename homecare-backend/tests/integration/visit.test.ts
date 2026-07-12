import { describe, it, expect, afterAll, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../../src/main.js'
import { prisma, disconnectDatabase } from '../../src/infrastructure/database/prismaClient.js'

let authCookie: string
let testPatientId: string
let testDoctorId: string
let testInsurerId: string
let testInternmentId: string
let testCarePlanId: string
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

describe('Visit Endpoints Integration Tests', () => {
  const patientDni = '35881499'
  const professionalCuit = '27-35881499-9'
  const insurerCuit = '30-35881499-9'
  let createdVisitId: string

  beforeAll(async () => {
    // 1. Clean up stale records from previous runs
    await prisma.visit.deleteMany({
      where: {
        internment: {
          patient: { dni: patientDni }
        }
      }
    })
    await prisma.carePlan.deleteMany({
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
        lastName:      'García Visits',
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
        lastName:              'Sosa Visits',
        firstName:             'Juan',
        dni:                   '35881491',
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
        name:        'Obra Social Visits',
        acronym:     'OSV',
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

    // 5. Create a care plan
    const carePlan = await prisma.carePlan.create({
      data: {
        internmentId:   testInternmentId,
        professionalId: testDoctorId,
        specialty:      'MEDICINE',
        frequency:      'WEEKLY',
        startDate:      new Date('2026-05-12'),
        active:         true,
      }
    })
    testCarePlanId = carePlan.id
  })

  describe('POST /api/internments/:internmentId/visits', () => {
    it('should create a visit successfully', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/visits`)
        .set('Cookie', authCookie)
        .send({
          carePlanId:     testCarePlanId,
          professionalId: testDoctorId,
          completedAt:    '2026-07-01T09:35:00.000Z',
          lat:            -34.9214,
          lng:            -57.9545,
          notes:          'Curación UPP talón derecho. Buena evolución.'
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBeDefined()
      expect(res.body.data.status).toBe('COMPLETED')
      expect(res.body.data.billed).toBe(false)
      expect(res.body.data.notes).toBe('Curación UPP talón derecho. Buena evolución.')
      expect(res.body.data.lat).toBe(-34.9214)
      expect(res.body.data.lng).toBe(-57.9545)
      
      createdVisitId = res.body.data.id
    })

    it('should return 401 if unauthorized', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/visits`)
        .send({
          carePlanId:     testCarePlanId,
          professionalId: testDoctorId,
          completedAt:    '2026-07-01T09:35:00.000Z',
        })

      expect(res.status).toBe(401)
    })

    it('should return 400 if lat/lng are out of bounds', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/visits`)
        .set('Cookie', authCookie)
        .send({
          carePlanId:     testCarePlanId,
          professionalId: testDoctorId,
          completedAt:    '2026-07-01T09:35:00.000Z',
          lat:            120, // max 90
        })

      expect(res.status).toBe(400)
    })

    it('should return 404 if professional does not exist or belongs to another company', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/visits`)
        .set('Cookie', authCookie)
        .send({
          carePlanId:     testCarePlanId,
          professionalId: nonExistentId,
          completedAt:    '2026-07-01T09:35:00.000Z',
        })

      expect(res.status).toBe(404)
    })

    it('should return 404 if carePlan does not belong to the internment', async () => {
      // Create a care plan for another internment to check ownership
      const otherPatient = await prisma.patient.create({
        data: {
          companyId:     (await prisma.company.findFirst())!.id,
          branchId,
          lastName:      'Other',
          firstName:     'Patient',
          dni:           '99999999',
          dateOfBirth:   new Date('1990-01-01'),
          biologicalSex: 'FEMALE',
          vatCondition:  'FINAL_CONSUMER',
          careAddress:   'Other Address 123',
          careCity:      'Other City',
          careProvince:  'Other Province',
          phone:         '1199999999',
        }
      })
      const otherInternment = await prisma.internment.create({
        data: {
          patientId:           otherPatient.id,
          branchId,
          healthInsurerId:     testInsurerId,
          responsibleDoctorId: testDoctorId,
          internmentType:      'ACUTE',
          admissionMode:       'FROM_HOME',
          admissionDate:       new Date('2026-05-12'),
          mainDiagnosis:       'Other',
          cie10Code:           'J44.9',
          status:              'ACTIVE',
        }
      })
      const otherCarePlan = await prisma.carePlan.create({
        data: {
          internmentId:   otherInternment.id,
          professionalId: testDoctorId,
          specialty:      'MEDICINE',
          frequency:      'WEEKLY',
          startDate:      new Date('2026-05-12'),
          active:         true,
        }
      })

      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/visits`)
        .set('Cookie', authCookie)
        .send({
          carePlanId:     otherCarePlan.id,
          professionalId: testDoctorId,
          completedAt:    '2026-07-01T09:35:00.000Z',
        })

      expect(res.status).toBe(404)

      // cleanup other internment/patient/carePlan
      await prisma.carePlan.delete({ where: { id: otherCarePlan.id } })
      await prisma.internment.delete({ where: { id: otherInternment.id } })
      await prisma.patient.delete({ where: { id: otherPatient.id } })
    })
  })

  describe('GET /api/internments/:internmentId/visits', () => {
    it('should list visits paginated', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/visits`)
        .set('Cookie', authCookie)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.length).toBeGreaterThan(0)
      expect(res.body.meta).toBeDefined()
      expect(res.body.meta.page).toBe(1)
      expect(res.body.meta.total).toBeGreaterThan(0)
    })

    it('should filter by professionalId', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/visits?professionalId=${testDoctorId}`)
        .set('Cookie', authCookie)

      expect(res.status).toBe(200)
      expect(res.body.data.every((v: any) => v.professionalId === testDoctorId)).toBe(true)
    })

    it('should filter by status', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/visits?status=COMPLETED`)
        .set('Cookie', authCookie)

      expect(res.status).toBe(200)
      expect(res.body.data.every((v: any) => v.status === 'COMPLETED')).toBe(true)
    })

    it('should return 404 for non-existent internment', async () => {
      const res = await request(app)
        .get(`/api/internments/${nonExistentId}/visits`)
        .set('Cookie', authCookie)

      expect(res.status).toBe(404)
    })
  })

  describe('GET /api/internments/:internmentId/visits/:visitId', () => {
    it('should retrieve the visit detail', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/visits/${createdVisitId}`)
        .set('Cookie', authCookie)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBe(createdVisitId)
    })

    it('should return 404 for non-existent visit', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/visits/${nonExistentId}`)
        .set('Cookie', authCookie)

      expect(res.status).toBe(404)
    })
  })

  describe('PATCH /api/internments/:internmentId/visits/:visitId/missed', () => {
    it('should mark the visit as MISSED', async () => {
      const res = await request(app)
        .patch(`/api/internments/${testInternmentId}/visits/${createdVisitId}/missed`)
        .set('Cookie', authCookie)
        .send({ missedReason: 'Paciente hospitalizado de urgencia' })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.status).toBe('MISSED')
      expect(res.body.data.missedReason).toBe('Paciente hospitalizado de urgencia')
    })

    it('should fail with 409 if marked as MISSED again', async () => {
      const res = await request(app)
        .patch(`/api/internments/${testInternmentId}/visits/${createdVisitId}/missed`)
        .set('Cookie', authCookie)
        .send({ missedReason: 'Otro motivo' })

      expect(res.status).toBe(409)
    })

    it('should fail with 409 if visit is already billed', async () => {
      // Temporarily mark visit as billed and COMPLETED to test constraints
      const tempVisit = await prisma.visit.create({
        data: {
          carePlanId:     testCarePlanId,
          professionalId: testDoctorId,
          internmentId:   testInternmentId,
          completedAt:    new Date(),
          scheduledDate:  new Date(),
          status:         'COMPLETED',
          billed:         true,
        }
      })

      const res = await request(app)
        .patch(`/api/internments/${testInternmentId}/visits/${tempVisit.id}/missed`)
        .set('Cookie', authCookie)
        .send({ missedReason: 'Intento fallido' })

      expect(res.status).toBe(409)

      // Clean up temp visit
      await prisma.visit.delete({ where: { id: tempVisit.id } })
    })
  })
})
