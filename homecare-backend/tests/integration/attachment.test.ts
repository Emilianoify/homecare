import { describe, it, expect, afterAll, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../../src/main.js'
import { prisma, disconnectDatabase } from '../../src/infrastructure/database/prismaClient.js'

let authCookie: string
let testPatientId: string
let testDoctorId: string
let testInsurerId: string
let testInternmentId: string
let testClinicalNoteId: string
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

describe('Attachment Endpoints Integration Tests', () => {
  const patientDni = '35881476'
  const professionalCuit = '27-35881476-9'
  const insurerCuit = '30-35881476-9'
  let createdAttachmentId: string

  beforeAll(async () => {
    // 1. Clean up stale records from previous runs
    await prisma.attachment.deleteMany({
      where: {
        internment: {
          patient: { dni: patientDni }
        }
      }
    })
    await prisma.clinicalNote.deleteMany({
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
        lastName:      'García Attachments',
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
        lastName:              'Sosa Attachments',
        firstName:             'Juan',
        dni:                   '35881476',
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
        name:        'Obra Social Attachments',
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

    // 5. Create a clinical note
    const user = await prisma.user.findFirst({ where: { companyId: company.id } })
    if (!user) throw new Error('No user found for company')

    const clinicalNote = await prisma.clinicalNote.create({
      data: {
        internmentId:   testInternmentId,
        professionalId: user.id,
        specialty:      'MEDICINE',
        datetime:       new Date('2026-06-01T12:00:00Z'),
        content:        'Daniel Rojas presents chronic respiratory conditions.',
        contentHash:    'abc123hash',
      }
    })
    testClinicalNoteId = clinicalNote.id
  })

  describe('POST /api/internments/:internmentId/attachments', () => {
    it('should create an attachment linked to the internment successfully', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/attachments`)
        .set('Cookie', authCookie)
        .send({
          type:       'LAB_RESULT',
          fileName:   'laboratorio-julio-2025.pdf',
          storageUrl: 'https://storage.example.com/hc/laboratorio-julio-2025.pdf',
          mimeType:   'application/pdf',
          sizeBytes:  245760
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBeDefined()
      expect(res.body.data.internmentId).toBe(testInternmentId)
      expect(res.body.data.clinicalNoteId).toBeNull()
      expect(res.body.data.type).toBe('LAB_RESULT')
      expect(res.body.data.fileName).toBe('laboratorio-julio-2025.pdf')
      expect(res.body.data.storageUrl).toBe('https://storage.example.com/hc/laboratorio-julio-2025.pdf')
      expect(res.body.data.mimeType).toBe('application/pdf')
      expect(res.body.data.sizeBytes).toBe(245760)
      expect(res.body.data.uploadedById).toBeDefined()

      createdAttachmentId = res.body.data.id
    })

    it('should create an attachment linked to a clinical note successfully', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/attachments`)
        .set('Cookie', authCookie)
        .send({
          clinicalNoteId: testClinicalNoteId,
          type:           'IMAGING',
          fileName:       'rx-torax-2025-07-01.jpg',
          storageUrl:     'https://storage.example.com/hc/rx-torax.jpg',
          mimeType:       'image/jpeg',
          sizeBytes:      1048576
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.clinicalNoteId).toBe(testClinicalNoteId)
      expect(res.body.data.type).toBe('IMAGING')
    })

    it('should return 401 if unauthorized', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/attachments`)
        .send({
          type:       'LAB_RESULT',
          fileName:   'laboratorio-julio-2025.pdf',
          storageUrl: 'https://storage.example.com/hc/laboratorio-julio-2025.pdf',
          mimeType:   'application/pdf',
          sizeBytes:  245760
        })

      expect(res.status).toBe(401)
    })

    it('should return 400 if storageUrl is invalid', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/attachments`)
        .set('Cookie', authCookie)
        .send({
          type:       'LAB_RESULT',
          fileName:   'laboratorio-julio-2025.pdf',
          storageUrl: 'invalid-url',
          mimeType:   'application/pdf',
          sizeBytes:  245760
        })

      expect(res.status).toBe(400)
    })

    it('should return 400 if sizeBytes is negative', async () => {
      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/attachments`)
        .set('Cookie', authCookie)
        .send({
          type:       'LAB_RESULT',
          fileName:   'laboratorio-julio-2025.pdf',
          storageUrl: 'https://storage.example.com/hc/laboratorio-julio-2025.pdf',
          mimeType:   'application/pdf',
          sizeBytes:  -10
        })

      expect(res.status).toBe(400)
    })

    it('should return 404 if clinicalNote does not belong to the internment', async () => {
      // Create another patient and internment
      const otherPatient = await prisma.patient.create({
        data: {
          companyId:     (await prisma.company.findFirst())!.id,
          branchId,
          lastName:      'Other Patient',
          firstName:     'Daniel',
          dni:           '99999991',
          dateOfBirth:   new Date('1990-01-01'),
          biologicalSex: 'MALE',
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
          mainDiagnosis:       'EPOC',
          cie10Code:           'J44.9',
          status:              'ACTIVE',
        }
      })
      const otherClinicalNote = await prisma.clinicalNote.create({
        data: {
          internmentId:   otherInternment.id,
          professionalId: (await prisma.user.findFirst())!.id,
          specialty:      'MEDICINE',
          datetime:       new Date(),
          content:        'Other internment clinical note content.',
          contentHash:    'hashother123',
        }
      })

      const res = await request(app)
        .post(`/api/internments/${testInternmentId}/attachments`)
        .set('Cookie', authCookie)
        .send({
          clinicalNoteId: otherClinicalNote.id,
          type:           'LAB_RESULT',
          fileName:       'laboratorio-julio-2025.pdf',
          storageUrl:     'https://storage.example.com/hc/laboratorio-julio-2025.pdf',
          mimeType:       'application/pdf',
          sizeBytes:      245760
        })

      expect(res.status).toBe(404)

      // Cleanup
      await prisma.clinicalNote.delete({ where: { id: otherClinicalNote.id } })
      await prisma.internment.delete({ where: { id: otherInternment.id } })
      await prisma.patient.delete({ where: { id: otherPatient.id } })
    })
  })

  describe('GET /api/internments/:internmentId/attachments', () => {
    it('should list attachments for an internment', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/attachments`)
        .set('Cookie', authCookie)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.length).toBeGreaterThan(0)
    })

    it('should filter by type', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/attachments?type=LAB_RESULT`)
        .set('Cookie', authCookie)

      expect(res.status).toBe(200)
      expect(res.body.data.every((a: any) => a.type === 'LAB_RESULT')).toBe(true)
    })

    it('should filter by clinicalNoteId', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/attachments?clinicalNoteId=${testClinicalNoteId}`)
        .set('Cookie', authCookie)

      expect(res.status).toBe(200)
      expect(res.body.data.every((a: any) => a.clinicalNoteId === testClinicalNoteId)).toBe(true)
    })

    it('should return 404 for non-existent internment', async () => {
      const res = await request(app)
        .get(`/api/internments/${nonExistentId}/attachments`)
        .set('Cookie', authCookie)

      expect(res.status).toBe(404)
    })
  })

  describe('GET /api/internments/:internmentId/attachments/:attachmentId', () => {
    it('should retrieve a single attachment details', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/attachments/${createdAttachmentId}`)
        .set('Cookie', authCookie)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBe(createdAttachmentId)
    })

    it('should return 404 for non-existent attachment', async () => {
      const res = await request(app)
        .get(`/api/internments/${testInternmentId}/attachments/${nonExistentId}`)
        .set('Cookie', authCookie)

      expect(res.status).toBe(404)
    })
  })

  describe('PUT & DELETE not allowed', () => {
    it('should return 404/405 for PUT', async () => {
      const res = await request(app)
        .put(`/api/internments/${testInternmentId}/attachments/${createdAttachmentId}`)
        .set('Cookie', authCookie)
        .send({ fileName: 'updated.pdf' })

      expect(res.status).toBe(404) // route doesn't exist
    })

    it('should return 404/405 for DELETE', async () => {
      const res = await request(app)
        .delete(`/api/internments/${testInternmentId}/attachments/${createdAttachmentId}`)
        .set('Cookie', authCookie)

      expect(res.status).toBe(404) // route doesn't exist
    })
  })
})
