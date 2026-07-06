import { z } from 'zod'

export const createClinicalNoteSchema = z.object({
  visitId:  z.uuid(),
  specialty: z.enum([
    'NURSING',
    'PHYSIOTHERAPY',
    'MEDICINE',
    'NUTRITION',
    'OCCUPATIONAL_THERAPY',
    'SPEECH_THERAPY',
    'PSYCHOLOGY',
    'SOCIAL_WORK',
    'CAREGIVER',
  ]),
  datetime: z.iso.datetime(),
  content:  z.string().min(10),
})

export const clinicalNoteParamsSchema = z.object({
  internmentId: z.uuid(),
  noteId:       z.uuid(),
})

export const internmentParamsSchema = z.object({
  internmentId: z.uuid(),
})

export type CreateClinicalNoteDto = z.infer<typeof createClinicalNoteSchema>
