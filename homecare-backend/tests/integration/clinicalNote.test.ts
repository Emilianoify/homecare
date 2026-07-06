import { describe, it, expect, afterAll, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../../src/main.js'
import { prisma, disconnectDatabase } from '../../src/infrastructure/database/prismaClient.js'

let authCookie: string
let testPatientId: string
let testDoctorId: string
let testInsurerId: string
let testInternmentId: string
let otherInternmentId: string
let testCarePlanId: string
let testVisitId: string
let otherVisitId: string // belonging to otherInternment
const branchId = 'aaaaaaaa-0000-4000-a000-000000000001'

describe('ClinicalNote Endpoints Integration Tests', () => {
  const patientDni = '46991220'
  const otherPatientDni = '46991222'
  const professionalCuit = '27-46991220-9'
  const insurerCuit = '30-46991220-9'
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
    await prisma.clinicalNote.deleteMany({
      where: {
        internment: {
          patient: { dni: { in: [patientDni, otherPatientDni] } }
        }
      }
    })
    await prisma.visit.deleteMany({
      where: {
        internment: {
          patient: { dni: { in: [patientDni, otherPatientDni] } }
        }
      }
    })
    await prisma.carePlan.deleteMany({
      where: {
        internment: {
          patient: { dni: { in: [patientDni, otherPatientDni] } }
        }
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
        lastName:      'Rojas',
        firstName:     'Daniel',
        dni:           patientDni,
        dateOfBirth:   new Date('1978-04-12'),
        biologicalSex: 'MALE',
        vatCondition:  'FINAL_CONSUMER',
        careAddress:   'Belgrano 1200',
        careCity:      'Buenos Aires',
        careProvince:  'CABA',
        phone:         '1167891234',
      }
    })
    testPatientId = patient.id

    const otherPatient = await prisma.patient.create({
      data: {
        companyId:     company.id,
        branchId,
        lastName:      'Gomez',
        firstName:     'Paula',
        dni:           otherPatientDni,
        dateOfBirth:   new Date('1982-08-20'),
        biologicalSex: 'FEMALE',
        vatCondition:  'FINAL_CONSUMER',
        careAddress:   'Santa Fe 2500',
        careCity:      'Buenos Aires',
        careProvince:  'CABA',
        phone:         '1176543210',
      }
    })

    const doc = await prisma.professional.create({
      data: {
        companyId:             company.id,
        lastName:              'Lopez',
        firstName:             'Maria',
        dni:                   '36991221',
        cuit:                  professionalCuit,
        vatCondition:          'MONOTAX',
        specialty:             'NURSING',
        contractType:          'MONOTAX',
        cbu:                   '0140099503605888001999',
        phone:                 '1199887766',
        availableForEmergency: false,
        hasOwnVehicle:         false,
      }
    })
    testDoctorId = doc.id

    const insurer = await prisma.healthInsurer.create({
      data: {
        companyId:   company.id,
        name:        'Obra Social Notas',
        acronym:     'OSN',
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
        internmentType:      'ACUTE',
        admissionMode:       'FROM_HOME',
        admissionDate:       new Date('2025-06-01'),
        mainDiagnosis:       'Postoperatorio',
        cie10Code:           'Z47.8',
      }
    })
    testInternmentId = internment.id

    const otherInternment = await prisma.internment.create({
      data: {
        patientId:           otherPatient.id,
        branchId,
        healthInsurerId:     testInsurerId,
        responsibleDoctorId: testDoctorId,
        internmentType:      'ACUTE',
        admissionMode:       'FROM_HOME',
        admissionDate:       new Date('2025-06-01'),
        mainDiagnosis:       'Postoperatorio',
        cie10Code:           'Z47.8',
      }
    })
    otherInternmentId = otherInternment.id

    // 5. Create CarePlans
    const carePlan = await prisma.carePlan.create({
      data: {
        internmentId:   testInternmentId,
        professionalId: testDoctorId,
        specialty:      'NURSING',
        frequency:      'WEEKLY',
        startDate:      new Date('2025-06-01'),
        active:         true,
      }
    })
    testCarePlanId = carePlan.id

    const otherCarePlan = await prisma.carePlan.create({
      data: {
        internmentId:   otherInternmentId,
        professionalId: testDoctorId,
        specialty:      'NURSING',
        frequency:      'WEEKLY',
        startDate:      new Date('2025-06-01'),
        active:         true,
      }
    })

    // 6. Create Visits
    const visit = await prisma.visit.create({
      data: {
        carePlanId:     testCarePlanId,
        professionalId: testDoctorId,
        internmentId:   testInternmentId,
        scheduledDate:  new Date('2025-06-05T10:00:00Z'),
        status:         'SCHEDULED',
      }
    })
    testVisitId = visit.id

    const otherVisit = await prisma.visit.create({
      data: {
        carePlanId:     otherCarePlan.id,
        professionalId: testDoctorId,
        internmentId:   otherInternmentId,
        scheduledDate:  new Date('2025-06-05T10:00:00Z'),
        status:         'SCHEDULED',
      }
    })
    otherVisitId = otherVisit.id
  })

  afterAll(async () => {
    // Clean up
    await prisma.clinicalNote.deleteMany({
      where: {
        internmentId: { in: [testInternmentId, otherInternmentId] }
      }
    })
    await prisma.visit.deleteMany({
      where: {
        internmentId: { in: [testInternmentId, otherInternmentId] }
      }
    })
    await prisma.carePlan.deleteMany({
      where: {
        internmentId: { in: [testInternmentId, otherInternmentId] }
      }
    })
    await prisma.internment.deleteMany({
      where: {
        id: { in: [testInternmentId, otherInternmentId] }
      }
    })
    await prisma.patient.deleteMany({
      where: {
        id: { in: [testPatientId] }
      }
    })
    await prisma.professional.deleteMany({ where: { id: testDoctorId } })
    await prisma.healthInsurer.deleteMany({ where: { id: testInsurerId } })

    await disconnectDatabase()
  })

  describe('POST /api/internments/:internmentId/clinical-notes', () => {
    it('debe retornar 401 si no tiene cookie de autenticacion', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/clinical-notes`)
        .send({
          visitId:   testVisitId,
          specialty: 'NURSING',
          datetime:  '2025-06-05T10:30:00.000Z',
          content:   'Control de signos vitales normal.',
        })
      expect(res.status).toBe(401)
    })

    it('debe retornar 404 si la internación no existe', async () => {
      const res = await request(app)
        .post(`/api/internments/${nonExistentId}/clinical-notes`)
        .set('Cookie', authCookie)
        .send({
          visitId:   testVisitId,
          specialty: 'NURSING',
          datetime:  '2025-06-05T10:30:00.000Z',
          content:   'Control de signos vitales normal.',
        })
      expect(res.status).toBe(404)
      expect(res.body.message).toContain('Internación no encontrada')
    })

    it('debe retornar 404 si la visita no pertenece a la internación', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/clinical-notes`)
        .set('Cookie', authCookie)
        .send({
          visitId:   otherVisitId, // visita de otra internación
          specialty: 'NURSING',
          datetime:  '2025-06-05T10:30:00.000Z',
          content:   'Control de signos vitales normal.',
        })
      expect(res.status).toBe(404)
      expect(res.body.message).toContain('La visita no pertenece a esta internación')
    })

    it('debe retornar 400 si el contenido es menor a 10 caracteres', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/clinical-notes`)
        .set('Cookie', authCookie)
        .send({
          visitId:   testVisitId,
          specialty: 'NURSING',
          datetime:  '2025-06-05T10:30:00.000Z',
          content:   'Corto',
        })
      expect(res.status).toBe(400)
    })

    let createdNoteId: string

    it('debe registrar correctamente la nota clínica (201)', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/clinical-notes`)
        .set('Cookie', authCookie)
        .send({
          visitId:   testVisitId,
          specialty: 'NURSING',
          datetime:  '2025-06-05T10:30:00.000Z',
          content:   'Paciente hemodinámicamente estable. Sin particularidades.',
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBeDefined()
      expect(res.body.data.internmentId).toBe(testInternmentId)
      expect(res.body.data.visitId).toBe(testVisitId)
      expect(res.body.data.contentHash).toBeDefined()
      expect(res.body.data.signed).toBe(false)
      expect(res.body.data.lockedAt).toBeNull()

      createdNoteId = res.body.data.id
    })

    it('debe retornar 409 si se intenta registrar otra nota para la misma visita', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/clinical-notes`)
        .set('Cookie', authCookie)
        .send({
          visitId:   testVisitId,
          specialty: 'NURSING',
          datetime:  '2025-06-05T11:30:00.000Z',
          content:   'Otra evolución del mismo día.',
        })
      expect(res.status).toBe(409)
      expect(res.body.message).toContain('La visita ya tiene una nota clínica registrada')
    })

    describe('GET /api/internments/:internmentId/clinical-notes', () => {
      it('debe retornar la lista de notas clínicas de la internación', async () => {
        const res = await request(app)
          .get(`/api/internments/${testInternmentId}/clinical-notes`)
          .set('Cookie', authCookie)

        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
        expect(res.body.data).toBeInstanceOf(Array)
        expect(res.body.data.length).toBe(1)
        expect(res.body.data[0].id).toBe(createdNoteId)
      })

      it('debe retornar 404 si la internación no existe al listar', async () => {
        const res = await request(app)
          .get(`/api/internments/${nonExistentId}/clinical-notes`)
          .set('Cookie', authCookie)
        expect(res.status).toBe(404)
      })
    })

    describe('GET /api/internments/:internmentId/clinical-notes/:noteId', () => {
      it('debe retornar el detalle de la nota clínica', async () => {
        const res = await request(app)
          .get(`/api/internments/${testInternmentId}/clinical-notes/${createdNoteId}`)
          .set('Cookie', authCookie)

        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
        expect(res.body.data.id).toBe(createdNoteId)
        expect(res.body.data.content).toBe('Paciente hemodinámicamente estable. Sin particularidades.')
      })

      it('debe retornar 404 si la nota no existe', async () => {
        const res = await request(app)
          .get(`/api/internments/${testInternmentId}/clinical-notes/${nonExistentId}`)
          .set('Cookie', authCookie)
        expect(res.status).toBe(404)
      })
    })

    describe('PATCH /api/internments/:internmentId/clinical-notes/:noteId/sign', () => {
      it('debe firmar la nota correctamente (200)', async () => {
        const res = await request(app)
          .patch(`/api/internments/${testInternmentId}/clinical-notes/${createdNoteId}/sign`)
          .set('Cookie', authCookie)

        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
        expect(res.body.data.signed).toBe(true)
        expect(res.body.data.lockedAt).toBeDefined()
        expect(res.body.data.lockedAt).not.toBeNull()
      })

      it('debe retornar 409 si se intenta firmar una nota ya firmada', async () => {
        const res = await request(app)
          .patch(`/api/internments/${testInternmentId}/clinical-notes/${createdNoteId}/sign`)
          .set('Cookie', authCookie)

        expect(res.status).toBe(409)
        expect(res.body.message).toContain('La nota clínica ya está firmada y no puede modificarse')
      })
    })
  })
})
