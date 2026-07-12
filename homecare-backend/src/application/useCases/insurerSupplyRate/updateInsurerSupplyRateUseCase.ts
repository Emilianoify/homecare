import type { IInsurerSupplyRateRepository } from '../../../domain/repositories/iInsurerSupplyRateRepository.js'
import type { IHealthInsurerRepository } from '../../../domain/repositories/iHealthInsurerRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { InsurerSupplyRateMapper } from '../../../interfaces/http/mappers/insurerSupplyRateMapper.js'
import type { UpdateInsurerSupplyRateDto } from '../../../interfaces/http/schemas/insurerSupplyRateSchema.js'
import type { InsurerSupplyRateResponseDto } from '../../../interfaces/http/dtos/insurerSupplyRateDto.js'

export class UpdateInsurerSupplyRateUseCase {
  constructor(
    private readonly insurerSupplyRateRepository: IInsurerSupplyRateRepository,
    private readonly healthInsurerRepository:     IHealthInsurerRepository
  ) {}

  async execute(
    healthInsurerId: string,
    supplyRateId:    string,
    dto:             UpdateInsurerSupplyRateDto,
    companyId:       string
  ): Promise<InsurerSupplyRateResponseDto> {
    const insurer = await this.healthInsurerRepository.findById(healthInsurerId, companyId)
    if (!insurer) throw new AppError(404, ERROR_MESSAGES.HEALTH_INSURER.NOT_FOUND)

    const rate = await this.insurerSupplyRateRepository.findById(supplyRateId, healthInsurerId)
    if (!rate) throw new AppError(404, ERROR_MESSAGES.INSURER_SUPPLY_RATE.NOT_FOUND)

    const updated = await this.insurerSupplyRateRepository.update(supplyRateId, {
      ...(dto.agreedPrice !== undefined && { agreedPrice: dto.agreedPrice }),
      ...(dto.validTo     !== undefined && { validTo: dto.validTo ? new Date(dto.validTo) : null }),
      ...(dto.active      !== undefined && { active: dto.active }),
    })

    return InsurerSupplyRateMapper.toDto(updated)
  }
}
