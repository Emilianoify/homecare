import type { IInsurerSupplyRateRepository } from '../../../domain/repositories/iInsurerSupplyRateRepository.js'
import type { IHealthInsurerRepository } from '../../../domain/repositories/iHealthInsurerRepository.js'
import type { ISupplyRepository } from '../../../domain/repositories/iSupplyRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { InsurerSupplyRateMapper } from '../../../interfaces/http/mappers/insurerSupplyRateMapper.js'
import type { CreateInsurerSupplyRateDto } from '../../../interfaces/http/schemas/insurerSupplyRateSchema.js'
import type { InsurerSupplyRateResponseDto } from '../../../interfaces/http/dtos/insurerSupplyRateDto.js'

export class CreateInsurerSupplyRateUseCase {
  constructor(
    private readonly insurerSupplyRateRepository: IInsurerSupplyRateRepository,
    private readonly healthInsurerRepository:     IHealthInsurerRepository,
    private readonly supplyRepository:            ISupplyRepository
  ) {}

  async execute(
    healthInsurerId: string,
    dto:             CreateInsurerSupplyRateDto,
    companyId:       string
  ): Promise<InsurerSupplyRateResponseDto> {
    // OS debe pertenecer a la company — ownership
    const insurer = await this.healthInsurerRepository.findById(healthInsurerId, companyId)
    if (!insurer) throw new AppError(404, ERROR_MESSAGES.HEALTH_INSURER.NOT_FOUND)

    // Insumo debe pertenecer a la misma company — ownership
    const supply = await this.supplyRepository.findById(dto.supplyId, companyId)
    if (!supply) throw new AppError(404, ERROR_MESSAGES.SUPPLY.NOT_FOUND)

    // No duplicar misma combinación OS + insumo + validFrom
    const validFrom  = new Date(dto.validFrom)
    const duplicate  = await this.insurerSupplyRateRepository.findDuplicate(
      healthInsurerId,
      dto.supplyId,
      validFrom
    )
    if (duplicate) throw new AppError(409, ERROR_MESSAGES.INSURER_SUPPLY_RATE.ALREADY_EXISTS)

    const rate = await this.insurerSupplyRateRepository.create({
      healthInsurerId,
      supplyId:    dto.supplyId,
      agreedPrice: dto.agreedPrice,
      validFrom,
      validTo:     dto.validTo ? new Date(dto.validTo) : null,
      active:      dto.active,
    })

    return InsurerSupplyRateMapper.toDto(rate)
  }
}
