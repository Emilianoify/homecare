import type { IHealthInsurerRepository } from '../../../domain/repositories/iHealthInsurerRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { HealthInsurerMapper } from '../../../interfaces/http/mappers/healthInsurerMapper.js'
import type { CreateHealthInsurerDto } from '../../../interfaces/http/schemas/healthInsurerSchema.js'
import type { HealthInsurerResponseDto } from '../../../interfaces/http/dtos/healthInsurerDto.js'

export class CreateHealthInsurerUseCase {
  constructor(private readonly healthInsurerRepository: IHealthInsurerRepository) {}

  async execute(dto: CreateHealthInsurerDto, companyId: string): Promise<HealthInsurerResponseDto> {
    const existing = await this.healthInsurerRepository.findByCuit(dto.cuit, companyId)
    if (existing) throw new AppError(409, ERROR_MESSAGES.HEALTH_INSURER.CUIT_EXISTS)

    const healthInsurer = await this.healthInsurerRepository.create({
      companyId,
      name:           dto.name,
      acronym:        dto.acronym,
      cuit:           dto.cuit,
      rnos:           dto.rnos           ?? null,
      insurerType:    dto.insurerType,
      billingEmail:   dto.billingEmail   ?? null,
      billingMode:    dto.billingMode,
      cutoffDay:      dto.cutoffDay      ?? null,
      paymentDays:    dto.paymentDays    ?? null,
      requiresPaper:  dto.requiresPaper,
      operativeNotes: dto.operativeNotes ?? null,
      active:         dto.active,
    })

    return HealthInsurerMapper.toDto(healthInsurer)
  }
}
