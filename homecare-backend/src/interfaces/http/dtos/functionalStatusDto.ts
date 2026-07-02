export interface FunctionalStatusResponseDto {
  id:                     string
  patientId:              string
  internmentId:           string
  recordedById:           string
  date:                   string
  bedridden:              boolean
  wheelchair:             boolean
  oxygenDependent:        boolean
  oxygenLitersPerMin:     number | null
  tracheostomy:           boolean
  pumpFeeding:            boolean
  nasogastricTube:        boolean
  urinaryCatheter:        boolean
  pressureUlcers:         boolean
  pressureUlcersLocation: string | null
  barthelScore:           Record<string, unknown> | null
  notes:                  string | null
  createdAt:              string
}
