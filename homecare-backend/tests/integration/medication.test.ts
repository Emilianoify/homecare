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
    .send({ email: 'admin@homecare.com', password: 'Admin123!' })
  
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

describe('Medication Endpoints Integration Tests', () => {
  const patientDni = '35881457'
  const professionalCuit = '27-35881457-9'
  const insurerCuit = '30-35881457-9'
  let createdMedicationId: string
  let secondaryMedicationId: string

  beforeAll(async () => {
    // 1. Clean up stale records from previous runs
    await prisma.medication.deleteMany({
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
        lastName:      'García Medicaciones',
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
        lastName:              'Sosa Medicaciones',
        firstName:             'Juan',
        dni:                   '35881458',
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
        name:        'Obra Social Medicaciones',
        acronym:     'OSM',
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

  describe('POST /api/internments/:internmentId/medications', () => {
    it('debe retornar 401 si no está autenticado', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/medications`)
        .send({
          name:      'Enalapril',
          dose:      '10mg',
          route:     'Oral',
          frequency: 'Cada 12 horas',
          startDate: '2026-05-12'
        })
      expect(res.status).toBe(401)
    })

    it('debe crear correctamente una medicación (201)', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/medications`)
        .set('Cookie', authCookie)
        .send({
          name:      'Enalapril',
          dose:      '10mg',
          route:     'Oral',
          frequency: 'Cada 12 horas',
          startDate: '2026-05-12'
        })
      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.name).toBe('Enalapril')
      expect(res.body.data.active).toBe(true)
      expect(res.body.data.prescribedById).toBeDefined()
      createdMedicationId = res.body.data.id
    })

    it('debe crear correctamente una segunda medicación (201)', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/medications`)
        .set('Cookie', authCookie)
        .send({
          name:      'Furosemida',
          dose:      '40mg',
          route:     'Oral',
          frequency: 'Una vez al día',
          startDate: '2026-05-12'
        })
      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.name).toBe('Furosemida')
      expect(res.body.data.active).toBe(true)
      secondaryMedicationId = res.body.data.id
    })

    it('debe retornar 400 si los campos son inválidos (nombre muy corto)', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/medications`)
        .set('Cookie', authCookie)
        .send({
          name:      'A',
          dose:      '10mg',
          route:     'Oral',
          frequency: 'Cada 12 horas',
          startDate: '2026-05-12'
        })
      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('debe retornar 404 si la internación no existe', async () => {
      const res = await request(app)
        .post(`/api/internments/${nonExistentId}/medications`)
        .set('Cookie', authCookie)
        .send({
          name:      'Enalapril',
          dose:      '10mg',
          route:     'Oral',
          frequency: 'Cada 12 horas',
          startDate: '2026-05-12'
        })
      expect(res.status).toBe(404)
    })
  })

  describe('GET /api/internments/:internmentId/medications', () => {
    it('debe listar todas las medicaciones de la internación', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/medications`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.length).toBe(2)
    })

    it('debe permitir filtrar por active=true', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/medications?active=true`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(200)
      expect(res.body.data.length).toBe(2)
    })

    it('debe permitir filtrar por active=false', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/medications?active=false`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(200)
      expect(res.body.data.length).toBe(0)
    })

    it('debe retornar 404 para internación inexistente', async () => {
      const res = await request(app)
        .get(`/api/internments/${nonExistentId}/medications`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(404)
    })
  })

  describe('PUT /api/internments/:internmentId/medications/:medicationId', () => {
    it('debe actualizar los datos de la medicación (200)', async () => {
      const res = await request(app)
        .put(`/api/internments/${testInternmentId}/medications/${createdMedicationId}`)
        .set('Cookie', authCookie)
        .send({
          dose: '20mg'
        })
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.dose).toBe('20mg')
    })

    it('debe retornar 404 si la medicación no existe', async () => {
      const res = await request(app)
        .put(`/api/internments/${testInternmentId}/medications/${nonExistentId}`)
        .set('Cookie', authCookie)
        .send({
          dose: '20mg'
        })
      expect(res.status).toBe(404)
    })
  })

  describe('PATCH /api/internments/:internmentId/medications/:medicationId/discontinue', () => {
    it('debe discontinuar correctamente una medicación', async () => {
      const res = await request(app)
        .patch(`/api/internments/${testInternmentId}/medications/${createdMedicationId}/discontinue`)
        .set('Cookie', authCookie)
        .send({
          endDate: '2026-07-11'
        })
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.active).toBe(false)
      expect(res.body.data.endDate).toBe('2026-07-11')
    })

    it('debe retornar 409 si ya está discontinuada al intentar discontinuar de nuevo', async () => {
      const res = await request(app)
        .patch(`/api/internments/${testInternmentId}/medications/${createdMedicationId}/discontinue`)
        .set('Cookie', authCookie)
        .send({
          endDate: '2026-07-12'
        })
      expect(res.status).toBe(409)
      expect(res.body.message).toBe('La medicación ya fue discontinuada')
    })

    it('debe retornar 409 al intentar actualizar una medicación discontinuada', async () => {
      const res = await request(app)
        .put(`/api/internments/${testInternmentId}/medications/${createdMedicationId}`)
        .set('Cookie', authCookie)
        .send({
          dose: '30mg'
        })
      expect(res.status).toBe(409)
      expect(res.body.message).toBe('La medicación ya fue discontinuada')
    })
  })

  describe('DELETE /api/internments/:internmentId/medications/:medicationId', () => {
    it('debe retornar 404 porque no existe la ruta delete', async () => {
      const res = await request(app)
        .delete(`/api/internments/${testInternmentId}/medications/${createdMedicationId}`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(404)
    })
  })
})
