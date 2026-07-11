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

describe('Diagnosis Endpoints Integration Tests', () => {
  const patientDni = '35881447'
  const professionalCuit = '27-35881447-9'
  const insurerCuit = '30-35881447-9'
  let createdDiagnosisId: string
  let secondaryDiagnosisId: string

  beforeAll(async () => {
    // 1. Clean up stale records from previous runs
    await prisma.diagnosis.deleteMany({
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
        lastName:      'García Diagnósticos',
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
        lastName:              'Sosa Diagnósticos',
        firstName:             'Juan',
        dni:                   '35881448',
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
        name:        'Obra Social Diagnósticos',
        acronym:     'OSD',
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

  describe('POST /api/internments/:internmentId/diagnoses', () => {
    it('debe retornar 401 si no está autenticado', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/diagnoses`)
        .send({
          cie10Code:        'N18.4',
          cie10Description: 'Insuficiencia renal crónica, estadio 4 (grave)',
          type:             'PRIMARY',
          status:           'ACTIVE',
          dateFrom:         '2026-05-12',
        })
      expect(res.status).toBe(401)
    })

    it('debe crear correctamente un diagnóstico primario (201)', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/diagnoses`)
        .set('Cookie', authCookie)
        .send({
          cie10Code:        'N18.4',
          cie10Description: 'Insuficiencia renal crónica, estadio 4 (grave)',
          type:             'PRIMARY',
          status:           'ACTIVE',
          dateFrom:         '2026-05-12',
        })
      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.cie10Code).toBe('N18.4')
      expect(res.body.data.type).toBe('PRIMARY')
      expect(res.body.data.status).toBe('ACTIVE')
      createdDiagnosisId = res.body.data.id
    })

    it('debe crear correctamente un diagnóstico secundario (201)', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/diagnoses`)
        .set('Cookie', authCookie)
        .send({
          cie10Code:        'E11.9',
          cie10Description: 'Diabetes mellitus tipo 2 sin complicaciones',
          type:             'SECONDARY',
          status:           'IN_TREATMENT',
          dateFrom:         '2026-05-12',
        })
      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.cie10Code).toBe('E11.9')
      expect(res.body.data.type).toBe('SECONDARY')
      expect(res.body.data.status).toBe('IN_TREATMENT')
      secondaryDiagnosisId = res.body.data.id
    })

    it('debe retornar 409 si se intenta crear otro diagnóstico primario activo', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/diagnoses`)
        .set('Cookie', authCookie)
        .send({
          cie10Code:        'J44.1',
          cie10Description: 'EPOC con exacerbación aguda',
          type:             'PRIMARY',
          status:           'ACTIVE',
          dateFrom:         '2026-06-01',
        })
      expect(res.status).toBe(409)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toBe('Ya existe un diagnóstico primario activo para esta internación')
    })

    it('debe retornar 400 si los campos son inválidos (código cie10 corto)', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/diagnoses`)
        .set('Cookie', authCookie)
        .send({
          cie10Code:        'AB',
          cie10Description: 'CIE10 corto',
          type:             'SECONDARY',
          status:           'ACTIVE',
          dateFrom:         '2026-05-12',
        })
      expect(res.status).toBe(400)
    })

    it('debe retornar 404 para una internación inexistente', async () => {
      const res = await request(app)
        .post('/api/internments/aaaaaaaa-0000-4000-a000-000000000099/diagnoses')
        .set('Cookie', authCookie)
        .send({
          cie10Code:        'N18.4',
          cie10Description: 'Insuficiencia renal crónica',
          type:             'SECONDARY',
          status:           'ACTIVE',
          dateFrom:         '2026-05-12',
        })
      expect(res.status).toBe(404)
    })
  })

  describe('GET /api/internments/:internmentId/diagnoses', () => {
    it('debe retornar 401 si no está autenticado', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/diagnoses`)
      expect(res.status).toBe(401)
    })

    it('debe listar los diagnósticos ordenados PRIMARY primero', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/diagnoses`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.length).toBe(2)
      expect(res.body.data[0].type).toBe('PRIMARY')
      expect(res.body.data[1].type).toBe('SECONDARY')
    })

    it('debe retornar 404 para una internación inexistente', async () => {
      const res = await request(app)
        .get('/api/internments/aaaaaaaa-0000-4000-a000-000000000099/diagnoses')
        .set('Cookie', authCookie)
      expect(res.status).toBe(404)
    })
  })

  describe('PUT /api/internments/:internmentId/diagnoses/:diagnosisId', () => {
    it('debe retornar 401 si no está autenticado', async () => {
      const res = await request(app)
        .put(`/api/internments/${testInternmentId}/diagnoses/${secondaryDiagnosisId}`)
        .send({
          status: 'RESOLVED',
          dateTo: '2026-07-01',
        })
      expect(res.status).toBe(401)
    })

    it('debe resolver el diagnóstico secundario con dateTo (200)', async () => {
      const res = await request(app)
        .put(`/api/internments/${testInternmentId}/diagnoses/${secondaryDiagnosisId}`)
        .set('Cookie', authCookie)
        .send({
          status: 'RESOLVED',
          dateTo: '2026-07-01',
        })
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.status).toBe('RESOLVED')
      expect(res.body.data.dateTo).toBe('2026-07-01')
    })

    it('debe retornar 442 o 400 si el formato del ID o de los campos es inválido', async () => {
      const res = await request(app)
        .put(`/api/internments/${testInternmentId}/diagnoses/invalid-uuid`)
        .set('Cookie', authCookie)
        .send({
          status: 'RESOLVED',
        })
      expect(res.status).toBe(400)
    })

    it('debe retornar 404 para un diagnóstico inexistente', async () => {
      const res = await request(app)
        .put(`/api/internments/${testInternmentId}/diagnoses/${nonExistentId}`)
        .set('Cookie', authCookie)
        .send({
          status: 'RESOLVED',
          dateTo: '2026-07-01',
        })
      expect(res.status).toBe(404)
    })
  })

  describe('POST /api/internments/:internmentId/diagnoses (Post-Resolución)', () => {
    it('debe permitir crear un nuevo PRIMARY una vez resuelto el anterior', async () => {
      // 1. Resolver el diagnóstico primario anterior
      const resolveRes = await request(app)
        .put(`/api/internments/${testInternmentId}/diagnoses/${createdDiagnosisId}`)
        .set('Cookie', authCookie)
        .send({
          status: 'RESOLVED',
          dateTo: '2026-07-01',
        })
      expect(resolveRes.status).toBe(200)

      // 2. Crear el nuevo primario
      const createRes = await request(app)
        .post(`/api/internments/${testInternmentId}/diagnoses`)
        .set('Cookie', authCookie)
        .send({
          cie10Code:        'J44.1',
          cie10Description: 'EPOC con exacerbación aguda',
          type:             'PRIMARY',
          status:           'ACTIVE',
          dateFrom:         '2026-07-02',
        })
      expect(createRes.status).toBe(201)
      expect(createRes.body.success).toBe(true)
      expect(createRes.body.data.cie10Code).toBe('J44.1')
    })
  })

  describe('DELETE /api/internments/:internmentId/diagnoses/:diagnosisId', () => {
    it('debe retornar 404 ya que no existe la ruta de DELETE', async () => {
      const res = await request(app)
        .delete(`/api/internments/${testInternmentId}/diagnoses/${createdDiagnosisId}`)
        .set('Cookie', authCookie)
      expect(res.status).toBe(404)
    })
  })
})
