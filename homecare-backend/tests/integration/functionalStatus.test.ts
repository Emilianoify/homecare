import { describe, it, expect, afterAll, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../../src/main.js'
import { prisma, disconnectDatabase } from '../../src/infrastructure/database/prismaClient.js'

let authCookie: string
let testPatientId: string
let testDoctorId: string
let testInsurerId: string
let testInternmentId: string
let otherPatientId: string
let otherInternmentId: string
const branchId = 'aaaaaaaa-0000-4000-a000-000000000001'

describe('FunctionalStatus Endpoints Integration Tests', () => {
  const patientDni = '45881440'
  const otherPatientDni = '45881442'
  const professionalCuit = '27-45881440-9'
  const insurerCuit = '30-45881440-9'
  const nonExistentId = 'aaaaaaaa-0000-4000-a000-000000000000'

  beforeAll(async () => {
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

    // 2. Clean up stale records
    await prisma.functionalStatus.deleteMany({
      where: {
        patient: { dni: { in: [patientDni, otherPatientDni] } }
      }
    })
    await prisma.internment.deleteMany({
      where: {
        patient: { dni: { in: [patientDni, otherPatientDni] } }
      }
    })
    await prisma.patient.deleteMany({ where: { dni: { in: [patientDni, otherPatientDni] } } })
    await prisma.professional.deleteMany({ where: { cuit: professionalCuit } })
    await prisma.healthInsurer.deleteMany({ where: { cuit: insurerCuit } })

    // 3. Retrieve company details from seeded db
    const company = await prisma.company.findFirst()
    if (!company) throw new Error('No company found in database')

    // 4. Create test dependencies
    const patient = await prisma.patient.create({
      data: {
        companyId:     company.id,
        branchId,
        lastName:      'García',
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

    const otherPatient = await prisma.patient.create({
      data: {
        companyId:     company.id,
        branchId,
        lastName:      'Fernandez',
        firstName:     'Ana',
        dni:           otherPatientDni,
        dateOfBirth:   new Date('1990-05-15'),
        biologicalSex: 'FEMALE',
        vatCondition:  'FINAL_CONSUMER',
        careAddress:   'Corrientes 500',
        careCity:      'Buenos Aires',
        careProvince:  'CABA',
        phone:         '1198765432',
      }
    })
    otherPatientId = otherPatient.id

    const doc = await prisma.professional.create({
      data: {
        companyId:             company.id,
        lastName:              'Sosa',
        firstName:             'Juan',
        dni:                   '35881441',
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
        name:        'Obra Social Test',
        acronym:     'OST',
        cuit:        insurerCuit,
        insurerType: 'PREPAID',
        billingMode: 'PER_VISIT',
      }
    })
    testInsurerId = insurer.id

    const internment = await prisma.internment.create({
      data: {
        patientId:           testPatientId,
        branchId,
        healthInsurerId:     testInsurerId,
        responsibleDoctorId: testDoctorId,
        internmentType:      'CHRONIC',
        admissionMode:       'FROM_HOME',
        admissionDate:       new Date('2025-05-01'),
        mainDiagnosis:       'Deterioro neurocognitivo',
        cie10Code:           'G30.9',
      }
    })
    testInternmentId = internment.id

    const otherInternment = await prisma.internment.create({
      data: {
        patientId:           otherPatientId,
        branchId,
        healthInsurerId:     testInsurerId,
        responsibleDoctorId: testDoctorId,
        internmentType:      'CHRONIC',
        admissionMode:       'FROM_HOME',
        admissionDate:       new Date('2025-05-01'),
        mainDiagnosis:       'Deterioro neurocognitivo',
        cie10Code:           'G30.9',
      }
    })
    otherInternmentId = otherInternment.id
  })

  afterAll(async () => {
    // Clean up
    await prisma.functionalStatus.deleteMany({
      where: {
        patientId: { in: [testPatientId, otherPatientId] }
      }
    })
    await prisma.internment.deleteMany({
      where: {
        id: { in: [testInternmentId, otherInternmentId] }
      }
    })
    await prisma.patient.deleteMany({
      where: {
        id: { in: [testPatientId, otherPatientId] }
      }
    })
    await prisma.professional.deleteMany({ where: { id: testDoctorId } })
    await prisma.healthInsurer.deleteMany({ where: { id: testInsurerId } })

    await disconnectDatabase()
  })

  describe('POST /api/patients/:patientId/functional-status', () => {
    it('debe retornar 401 si no tiene cookie de autenticacion', async () => {
      const res = await request(app)
        .post(`/api/patients/${testPatientId}/functional-status`)
        .send({
          internmentId: testInternmentId,
          date: '2025-06-01',
          bedridden: true,
        })
      expect(res.status).toBe(401)
    })

    it('debe retornar 404 si el paciente no existe', async () => {
      const res = await request(app)
        .post(`/api/patients/${nonExistentId}/functional-status`)
        .set('Cookie', authCookie)
        .send({
          internmentId: testInternmentId,
          date: '2025-06-01',
          bedridden: true,
        })
      expect(res.status).toBe(404)
      expect(res.body.success).toBe(false)
    })

    it('debe retornar 404 si la internación no pertenece al paciente', async () => {
      const res = await request(app)
        .post(`/api/patients/${testPatientId}/functional-status`)
        .set('Cookie', authCookie)
        .send({
          internmentId: otherInternmentId, // pertenece a otherPatient
          date: '2025-06-01',
          bedridden: true,
        })
      expect(res.status).toBe(404)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toContain('La internación no pertenece a este paciente')
    })

    it('debe retornar 400 si el body es inválido', async () => {
      const res = await request(app)
        .post(`/api/patients/${testPatientId}/functional-status`)
        .set('Cookie', authCookie)
        .send({
          internmentId: 'invalid-uuid',
          date: 'not-a-date',
        })
      expect(res.status).toBe(400)
    })

    it('debe registrar correctamente el estado funcional (201)', async () => {
      const payload = {
        internmentId:           testInternmentId,
        date:                   '2025-06-01',
        bedridden:              true,
        wheelchair:             false,
        oxygenDependent:        true,
        oxygenLitersPerMin:     2.5,
        tracheostomy:           false,
        pumpFeeding:            false,
        nasogastricTube:        false,
        urinaryCatheter:        true,
        pressureUlcers:         true,
        pressureUlcersLocation: 'Talón derecho grado II',
        barthelScore: {
          feeding: 5,
          total:   10,
        },
        notes: 'Deterioro funcional',
      }

      const res = await request(app)
        .post(`/api/patients/${testPatientId}/functional-status`)
        .set('Cookie', authCookie)
        .send(payload)

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBeDefined()
      expect(res.body.data.patientId).toBe(testPatientId)
      expect(res.body.data.internmentId).toBe(testInternmentId)
      expect(res.body.data.recordedById).toBeDefined() // viene de req.user
      expect(res.body.data.date).toBe('2025-06-01')
      expect(res.body.data.oxygenLitersPerMin).toBe(2.5) // número, no string
      expect(res.body.data.barthelScore).toEqual(payload.barthelScore)
      expect(res.body.data.pressureUlcersLocation).toBe('Talón derecho grado II')
    })

    it('debe permitir multiples registros para el mismo paciente', async () => {
      const payload = {
        internmentId: testInternmentId,
        date:         '2025-07-01',
        bedridden:    true,
        barthelScore: {
          total: 15,
        },
      }

      const res = await request(app)
        .post(`/api/patients/${testPatientId}/functional-status`)
        .set('Cookie', authCookie)
        .send(payload)

      expect(res.status).toBe(201)
    })
  })

  describe('GET /api/patients/:patientId/functional-status', () => {
    it('debe retornar lista de estados funcionales ordenada por fecha descendente', async () => {
      const res = await request(app)
        .get(`/api/patients/${testPatientId}/functional-status`)
        .set('Cookie', authCookie)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toBeInstanceOf(Array)
      expect(res.body.data.length).toBe(2)
      // Orden descendente por date
      expect(res.body.data[0].date).toBe('2025-07-01')
      expect(res.body.data[1].date).toBe('2025-06-01')
    })

    it('debe filtrar por internación si se provee internmentId', async () => {
      const res = await request(app)
        .get(`/api/patients/${testPatientId}/functional-status?internmentId=${testInternmentId}`)
        .set('Cookie', authCookie)

      expect(res.status).toBe(200)
      expect(res.body.data.length).toBe(2)

      const emptyRes = await request(app)
        .get(`/api/patients/${testPatientId}/functional-status?internmentId=${otherInternmentId}`)
        .set('Cookie', authCookie)
      expect(emptyRes.status).toBe(200)
      expect(emptyRes.body.data.length).toBe(0)
    })

    it('debe retornar 404 para paciente inexistente', async () => {
      const res = await request(app)
        .get(`/api/patients/${nonExistentId}/functional-status`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(404)
    })
  })

  describe('GET /api/patients/:patientId/functional-status/latest', () => {
    it('debe retornar el registro más reciente', async () => {
      const res = await request(app)
        .get(`/api/patients/${testPatientId}/functional-status/latest`)
        .set('Cookie', authCookie)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.date).toBe('2025-07-01')
      expect(res.body.data.barthelScore.total).toBe(15)
    })

    it('debe retornar null si no hay registros', async () => {
      const res = await request(app)
        .get(`/api/patients/${otherPatientId}/functional-status/latest`)
        .set('Cookie', authCookie)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toBeNull()
    })
  })
})
