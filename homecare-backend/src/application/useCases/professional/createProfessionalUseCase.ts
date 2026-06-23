import type { IProfessionalRepository } from '../../../domain/repositories/iProfessionalRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { ProfessionalMapper } from '../../../interfaces/http/mappers/professionalMapper.js'
import type { CreateProfessionalDto } from '../../../interfaces/http/schemas/professionalSchema.js'
import type { ProfessionalResponseDto } from '../../../interfaces/http/dtos/professionalDto.js'

export class CreateProfessionalUseCase {
  constructor(private readonly professionalRepository: IProfessionalRepository) {}

  async execute(dto: CreateProfessionalDto, companyId: string): Promise<ProfessionalResponseDto> {
    const existing = await this.professionalRepository.findByCuit(dto.cuit, companyId)
    if (existing) throw new AppError(409, ERROR_MESSAGES.PROFESSIONAL.CUIT_EXISTS)

    const professional = await this.professionalRepository.create({
      ...dto,
      companyId,
      secondarySpecialties:  dto.secondarySpecialties  ?? null,
      nationalLicense:       dto.nationalLicense        ?? null,
      provincialLicense:     dto.provincialLicense      ?? null,
      licenseProvince:       dto.licenseProvince        ?? null,
      licenseExpiresAt:      dto.licenseExpiresAt ? new Date(dto.licenseExpiresAt) : null,
      rnp:                   dto.rnp                    ?? null,
      bankAlias:             dto.bankAlias              ?? null,
      bank:                  dto.bank                   ?? null,
      coverageZones:         dto.coverageZones          ?? null,
      email:                 dto.email                  ?? null,
      active:                true,
    })

    return ProfessionalMapper.toDto(professional)
  }
}
