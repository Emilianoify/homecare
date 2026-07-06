import type { IInsurerRateRepository } from '../../../domain/repositories/iInsurerRateRepository.js'
import type { IHealthInsurerRepository } from '../../../domain/repositories/iHealthInsurerRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { InsurerRateMapper } from '../../../interfaces/http/mappers/insurerRateMapper.js'
import type { UpdateInsurerRateDto } from '../../../interfaces/http/schemas/insurerRateSchema.js'
import type { InsurerRateResponseDto } from '../../../interfaces/http/dtos/insurerRateDto.js'

export class UpdateInsurerRateUseCase {
  constructor(
    private readonly insurerRateRepository:   IInsurerRateRepository,
    private readonly healthInsurerRepository: IHealthInsurerRepository
  ) {}

  async execute(
    healthInsurerId: string,
    rateId: string,
    dto: UpdateInsurerRateDto,
    companyId: string
  ): Promise<InsurerRateResponseDto> {
    const insurer = await this.healthInsurerRepository.findById(healthInsurerId, companyId)
    if (!insurer) throw new AppError(404, ERROR_MESSAGES.HEALTH_INSURER.NOT_FOUND)

    const rate = await this.insurerRateRepository.findById(rateId, healthInsurerId)
    if (!rate) throw new AppError(404, ERROR_MESSAGES.INSURER_RATE.NOT_FOUND)

    const updated = await this.insurerRateRepository.update(rateId, {
      ...(dto.agreedPrice !== undefined && { agreedPrice: dto.agreedPrice }),
      ...(dto.validTo     !== undefined && { validTo: dto.validTo ? new Date(dto.validTo) : null }),
      ...(dto.active      !== undefined && { active: dto.active }),
    })

    return InsurerRateMapper.toDto(updated)
  }
}
