import type { FunctionalStatusEntity } from '../../../domain/entities/functionalStatusEntity.js'
import type { FunctionalStatusResponseDto } from '../dtos/functionalStatusDto.js'

export class FunctionalStatusMapper {
  static toDto(fs: FunctionalStatusEntity): FunctionalStatusResponseDto {
    return {
      id:                     fs.id,
      patientId:              fs.patientId,
      internmentId:           fs.internmentId,
      recordedById:           fs.recordedById,
      date:                   fs.date.toISOString().split('T')[0]!,
      bedridden:              fs.bedridden,
      wheelchair:             fs.wheelchair,
      oxygenDependent:        fs.oxygenDependent,
      oxygenLitersPerMin:     fs.oxygenLitersPerMin,
      tracheostomy:           fs.tracheostomy,
      pumpFeeding:            fs.pumpFeeding,
      nasogastricTube:        fs.nasogastricTube,
      urinaryCatheter:        fs.urinaryCatheter,
      pressureUlcers:         fs.pressureUlcers,
      pressureUlcersLocation: fs.pressureUlcersLocation,
      barthelScore:           fs.barthelScore,
      notes:                  fs.notes,
      createdAt:              fs.createdAt.toISOString(),
    }
  }
}
