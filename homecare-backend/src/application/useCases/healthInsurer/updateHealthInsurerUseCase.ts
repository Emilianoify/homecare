import type { IHealthInsurerRepository } from '../../../domain/repositories/iHealthInsurerRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { HealthInsurerMapper } from '../../../interfaces/http/mappers/healthInsurerMapper.js'
import type { UpdateHealthInsurerDto } from '../../../interfaces/http/schemas/healthInsurerSchema.js'
import type { HealthInsurerResponseDto } from '../../../interfaces/http/dtos/healthInsurerDto.js'

export class UpdateHealthInsurerUseCase {
  constructor(private readonly healthInsurerRepository: IHealthInsurerRepository) {}

  async execute(id: string, dto: UpdateHealthInsurerDto, companyId: string): Promise<HealthInsurerResponseDto> {
    const healthInsurer = await this.healthInsurerRepository.findById(id, companyId)
    if (!healthInsurer) throw new AppError(404, ERROR_MESSAGES.HEALTH_INSURER.NOT_FOUND)

    if (dto.cuit && dto.cuit !== healthInsurer.cuit) {
      const existing = await this.healthInsurerRepository.findByCuit(dto.cuit, companyId)
      if (existing) throw new AppError(409, ERROR_MESSAGES.HEALTH_INSURER.CUIT_EXISTS)
    }

    const updated = await this.healthInsurerRepository.update(id, dto)
    return HealthInsurerMapper.toDto(updated)
  }
}
