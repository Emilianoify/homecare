import type { IHealthInsurerRepository } from '../../../domain/repositories/iHealthInsurerRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { HealthInsurerMapper } from '../../../interfaces/http/mappers/healthInsurerMapper.js'
import type { HealthInsurerResponseDto } from '../../../interfaces/http/dtos/healthInsurerDto.js'

export class GetHealthInsurerUseCase {
  constructor(private readonly healthInsurerRepository: IHealthInsurerRepository) {}

  async execute(id: string, companyId: string): Promise<HealthInsurerResponseDto> {
    const healthInsurer = await this.healthInsurerRepository.findById(id, companyId)
    if (!healthInsurer) throw new AppError(404, ERROR_MESSAGES.HEALTH_INSURER.NOT_FOUND)
    return HealthInsurerMapper.toDto(healthInsurer)
  }
}
