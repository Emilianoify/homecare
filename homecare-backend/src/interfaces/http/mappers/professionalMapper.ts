import type { ProfessionalEntity } from '../../../domain/entities/professionalEntity.js'
import type { ProfessionalResponseDto, ProfessionalDetailDto } from '../dtos/professionalDto.js'

export class ProfessionalMapper {
  static toDto(p: ProfessionalEntity): ProfessionalResponseDto {
    return {
      id:                    p.id,
      lastName:              p.lastName,
      firstName:             p.firstName,
      fullName:              `${p.lastName}, ${p.firstName}`,
      dni:                   p.dni,
      cuit:                  p.cuit,
      vatCondition:          p.vatCondition,
      specialty:             p.specialty,
      secondarySpecialties:  p.secondarySpecialties as string[] | null,
      nationalLicense:       p.nationalLicense,
      provincialLicense:     p.provincialLicense,
      licenseProvince:       p.licenseProvince,
      licenseExpiresAt:      p.licenseExpiresAt?.toISOString().split('T')[0] ?? null,
      rnp:                   p.rnp,
      contractType:          p.contractType,
      bankAlias:             p.bankAlias,
      bank:                  p.bank,
      coverageZones:         p.coverageZones as string[] | null,
      availableForEmergency: p.availableForEmergency,
      hasOwnVehicle:         p.hasOwnVehicle,
      phone:                 p.phone,
      email:                 p.email,
      active:                p.active,
      createdAt:             p.createdAt.toISOString(),
    }
  }

  static toDetailDto(p: ProfessionalEntity): ProfessionalDetailDto {
    return {
      ...ProfessionalMapper.toDto(p),
      cbu: p.cbu,
    }
  }
}
