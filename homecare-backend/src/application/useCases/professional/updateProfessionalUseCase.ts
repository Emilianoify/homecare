import type { IProfessionalRepository } from '../../../domain/repositories/iProfessionalRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { ProfessionalMapper } from '../../../interfaces/http/mappers/professionalMapper.js'
import type { UpdateProfessionalDto } from '../../../interfaces/http/schemas/professionalSchema.js'
import type { ProfessionalResponseDto } from '../../../interfaces/http/dtos/professionalDto.js'

export class UpdateProfessionalUseCase {
  constructor(private readonly professionalRepository: IProfessionalRepository) {}

  async execute(id: string, dto: UpdateProfessionalDto, companyId: string): Promise<ProfessionalResponseDto> {
    const professional = await this.professionalRepository.findById(id, companyId)
    if (!professional) throw new AppError(404, ERROR_MESSAGES.PROFESSIONAL.NOT_FOUND)

    if (dto.cuit && dto.cuit !== professional.cuit) {
      const existing = await this.professionalRepository.findByCuit(dto.cuit, companyId)
      if (existing) throw new AppError(409, ERROR_MESSAGES.PROFESSIONAL.CUIT_EXISTS)
    }

    const { licenseExpiresAt, ...rest } = dto
    const updated = await this.professionalRepository.update(id, {
      ...rest,
      ...(licenseExpiresAt && { licenseExpiresAt: new Date(licenseExpiresAt) }),
    })

    return ProfessionalMapper.toDto(updated)
  }
}
