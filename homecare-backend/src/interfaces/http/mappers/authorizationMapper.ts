import type { AuthorizationEntity } from '../../../domain/entities/authorizationEntity.js'
import type { AuthorizationResponseDto } from '../dtos/authorizationDto.js'

export class AuthorizationMapper {
  static toDto(a: AuthorizationEntity): AuthorizationResponseDto {
    return {
      id:               a.id,
      internmentId:     a.internmentId,
      healthInsurerId:  a.healthInsurerId,
      number:           a.number,
      opNumber:         a.opNumber,
      type:             a.type,
      validFrom:        a.validFrom.toISOString().split('T')[0]!,
      validTo:          a.validTo.toISOString().split('T')[0]!,
      authorizedModules:a.authorizedModules,
      status:           a.status,
      notes:            a.notes,
      createdAt:        a.createdAt.toISOString(),
    }
  }
}
