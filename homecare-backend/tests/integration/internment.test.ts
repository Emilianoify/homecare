import { describe, it, expect, afterAll, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../../src/main.js'
import { prisma, disconnectDatabase } from '../../src/infrastructure/database/prismaClient.js'

let authCookie: string
let testPatientId: string
let testDoctorId: string
let testInsurerId: string
const branchId = 'aaaaaaaa-0000-4000-a000-000000000001'

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

describe('Internment Endpoints Integration Tests', () => {
  let createdInternmentId: string
  const patientDni = '35881440'
  const professionalCuit = '27-35881440-9'
  const insurerCuit = '30-35881440-9'

  beforeAll(async () => {
    // 1. Clean up stale records
    await prisma.internment.deleteMany({
      where: {
        patient: { dni: patientDni }
      }
    })
    await prisma.patient.deleteMany({ where: { dni: patientDni } })
    await prisma.professional.deleteMany({ where: { cuit: professionalCuit } })
    await prisma.healthInsurer.deleteMany({ where: { cuit: insurerCuit } })

    // 2. Retrieve company details from seeded db
    const company = await prisma.company.findFirst()
    if (!company) throw new Error('No company found in database')

    // 3. Create test dependencies
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
  })

  afterAll(async () => {
    // Clean up created records
    await prisma.internment.deleteMany({
      where: {
        patientId: testPatientId
      }
    })
    await prisma.patient.deleteMany({ where: { id: testPatientId } })
    await prisma.professional.deleteMany({ where: { id: testDoctorId } })
    await prisma.healthInsurer.deleteMany({ where: { id: testInsurerId } })
  })

  it('POST /api/internments - 401 sin cookie', async () => {
    const res = await request(app)
      .post('/api/internments')
      .send({
        patientId:           testPatientId,
        branchId,
        healthInsurerId:     testInsurerId,
        responsibleDoctorId: testDoctorId,
        internmentType:      'CHRONIC',
        admissionMode:       'FROM_HOME',
        admissionDate:       '2025-05-12',
        mainDiagnosis:       'Insuficiencia renal crónica estadio IV',
        cie10Code:           'N18.4',
        medicalFamilyAgreement: true,
        medicalFamilyAgreementDate: '2025-05-10',
      })
    expect(res.status).toBe(401)
  })

  it('POST /api/internments - 201 crea correctamente con status ACTIVE', async () => {
    const res = await request(app)
      .post('/api/internments')
      .set('Cookie', authCookie)
      .send({
        patientId:           testPatientId,
        branchId,
        healthInsurerId:     testInsurerId,
        responsibleDoctorId: testDoctorId,
        internmentType:      'CHRONIC',
        admissionMode:       'FROM_HOME',
        admissionDate:       '2025-05-12',
        mainDiagnosis:       'Insuficiencia renal crónica estadio IV',
        cie10Code:           'N18.4',
        medicalFamilyAgreement: true,
        medicalFamilyAgreementDate: '2025-05-10',
      })
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.id).toBeDefined()
    expect(res.body.data.status).toBe('ACTIVE')
    createdInternmentId = res.body.data.id
  })

  it('POST /api/internments - 409 mismo paciente ya internado', async () => {
    const res = await request(app)
      .post('/api/internments')
      .set('Cookie', authCookie)
      .send({
        patientId:           testPatientId,
        branchId,
        healthInsurerId:     testInsurerId,
        responsibleDoctorId: testDoctorId,
        internmentType:      'ACUTE',
        admissionMode:       'HOSPITAL_DISCHARGE',
        admissionDate:       '2025-05-13',
        mainDiagnosis:       'Insuficiencia cardiaca congestiva',
        cie10Code:           'I50.0',
      })
    expect(res.status).toBe(409)
    expect(res.body.success).toBe(false)
  })

  it('POST /api/internments - 400 body inválido', async () => {
    const res = await request(app)
      .post('/api/internments')
      .set('Cookie', authCookie)
      .send({
        patientId:           'not-a-uuid', // invalid
        branchId,
        healthInsurerId:     testInsurerId,
        responsibleDoctorId: testDoctorId,
        internmentType:      'CHRONIC',
        admissionMode:       'FROM_HOME',
        admissionDate:       '2025-05-12',
      })
    expect(res.status).toBe(400)
  })

  it('GET /api/internments - 200 devuelve lista paginada', async () => {
    const res = await request(app)
      .get('/api/internments')
      .set('Cookie', authCookie)
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toBeDefined()
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.meta).toBeDefined()
  })

  it('GET /api/internments?status=ACTIVE - 200 filtra correctamente', async () => {
    const res = await request(app)
      .get('/api/internments?status=ACTIVE')
      .set('Cookie', authCookie)
    expect(res.status).toBe(200)
    expect(res.body.data.every((i: any) => i.status === 'ACTIVE')).toBe(true)
  })

  it('GET /api/internments?patientId=:patientId - 200 filtra correctamente', async () => {
    const res = await request(app)
      .get(`/api/internments?patientId=${testPatientId}`)
      .set('Cookie', authCookie)
    expect(res.status).toBe(200)
    expect(res.body.data.every((i: any) => i.patientId === testPatientId)).toBe(true)
  })

  it('GET /api/internments?branchId=:branchId - 200 filtra correctamente', async () => {
    const res = await request(app)
      .get(`/api/internments?branchId=${branchId}`)
      .set('Cookie', authCookie)
    expect(res.status).toBe(200)
    expect(res.body.data.every((i: any) => i.branchId === branchId)).toBe(true)
  })

  it('GET /api/internments/:id - 200 devuelve detalle completo', async () => {
    const res = await request(app)
      .get(`/api/internments/${createdInternmentId}`)
      .set('Cookie', authCookie)
    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe(createdInternmentId)
    expect(res.body.data.mainDiagnosis).toBe('Insuficiencia renal crónica estadio IV')
  })

  it('GET /api/internments/:id - 404 con ID inexistente', async () => {
    const res = await request(app)
      .get('/api/internments/aaaaaaaa-0000-4000-a000-000000000000')
      .set('Cookie', authCookie)
    expect(res.status).toBe(404)
  })

  it('PUT /api/internments/:id - 200 actualiza campos correctamente', async () => {
    const res = await request(app)
      .put(`/api/internments/${createdInternmentId}`)
      .set('Cookie', authCookie)
      .send({
        notes: 'Paciente con leve mejoría.',
      })
    expect(res.status).toBe(200)
    expect(res.body.data.notes).toBe('Paciente con leve mejoría.')
  })

  it('PATCH /api/internments/:id/discharge - 400 sin dischargeDate', async () => {
    const res = await request(app)
      .patch(`/api/internments/${createdInternmentId}/discharge`)
      .set('Cookie', authCookie)
      .send({
        dischargeReason: 'Alta médica',
      })
    expect(res.status).toBe(400)
  })

  it('PATCH /api/internments/:id/discharge - 200 registra egreso con status DISCHARGED', async () => {
    const res = await request(app)
      .patch(`/api/internments/${createdInternmentId}/discharge`)
      .set('Cookie', authCookie)
      .send({
        dischargeDate:   '2025-08-15',
        dischargeReason: 'Alta médica por mejoría clínica sostenida',
      })
    expect(res.status).toBe(200)
    expect(res.body.data.status).toBe('DISCHARGED')
    expect(res.body.data.dischargeDate).toBe('2025-08-15')
    expect(res.body.data.dischargeReason).toBe('Alta médica por mejoría clínica sostenida')
  })

  it('Paciente dado de alta puede ser internado nuevamente - 201', async () => {
    const res = await request(app)
      .post('/api/internments')
      .set('Cookie', authCookie)
      .send({
        patientId:           testPatientId,
        branchId,
        healthInsurerId:     testInsurerId,
        responsibleDoctorId: testDoctorId,
        internmentType:      'CHRONIC',
        admissionMode:       'FROM_HOME',
        admissionDate:       '2025-08-20',
        mainDiagnosis:       'Seguimiento por mejoría',
        cie10Code:           'Z09.9',
      })
    expect(res.status).toBe(201)
    expect(res.body.data.status).toBe('ACTIVE')
    // We clean up this new internment ID too
    await prisma.internment.delete({ where: { id: res.body.data.id } })
  })

  it('DELETE /api/internments/:id - 204', async () => {
    const res = await request(app)
      .delete(`/api/internments/${createdInternmentId}`)
      .set('Cookie', authCookie)
    expect(res.status).toBe(204)
  })

  it('GET /api/internments - no incluye el internment eliminado', async () => {
    const res = await request(app)
      .get('/api/internments')
      .set('Cookie', authCookie)
    const found = res.body.data.find((i: any) => i.id === createdInternmentId)
    expect(found).toBeUndefined()
  })
})
