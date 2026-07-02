import { z } from 'zod'

export const createFunctionalStatusSchema = z.object({
  internmentId:           z.uuid(),
  date:                   z.iso.date(),
  bedridden:              z.boolean().default(false),
  wheelchair:             z.boolean().default(false),
  oxygenDependent:        z.boolean().default(false),
  oxygenLitersPerMin:     z.number().positive().optional(),
  tracheostomy:           z.boolean().default(false),
  pumpFeeding:            z.boolean().default(false),
  nasogastricTube:        z.boolean().default(false),
  urinaryCatheter:        z.boolean().default(false),
  pressureUlcers:         z.boolean().default(false),
  pressureUlcersLocation: z.string().optional(),
  barthelScore:           z.record(z.string(), z.unknown()).optional(),
  notes:                  z.string().optional(),
})

export const functionalStatusParamsSchema = z.object({
  patientId: z.uuid(),
})

export const functionalStatusQuerySchema = z.object({
  internmentId: z.uuid().optional(),
})

export type CreateFunctionalStatusDto = z.infer<typeof createFunctionalStatusSchema>
