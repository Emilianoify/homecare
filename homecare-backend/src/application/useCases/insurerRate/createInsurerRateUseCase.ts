import type { IInsurerRateRepository } from '../../../domain/repositories/iInsurerRateRepository.js'
import type { IHealthInsurerRepository } from '../../../domain/repositories/iHealthInsurerRepository.js'
import type { IServiceItemRepository } from '../../../domain/repositories/iServiceItemRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { InsurerRateMapper } from '../../../interfaces/http/mappers/insurerRateMapper.js'
import type { CreateInsurerRateDto } from '../../../interfaces/http/schemas/insurerRateSchema.js'
import type { InsurerRateResponseDto } from '../../../interfaces/http/dtos/insurerRateDto.js'

export class CreateInsurerRateUseCase {
  constructor(
    private readonly insurerRateRepository:   IInsurerRateRepository,
    private readonly healthInsurerRepository: IHealthInsurerRepository,
    private readonly serviceItemRepository:   IServiceItemRepository
  ) {}

  async execute(
    healthInsurerId: string,
    dto: CreateInsurerRateDto,
    companyId: string
  ): Promise<InsurerRateResponseDto> {
    // Verificar que la obra social existe y pertenece a la company
    const insurer = await this.healthInsurerRepository.findById(healthInsurerId, companyId)
    if (!insurer) throw new AppError(404, ERROR_MESSAGES.HEALTH_INSURER.NOT_FOUND)

    // Verificar que la prestación existe
    const item = await this.serviceItemRepository.findById(dto.serviceItemId)
    if (!item) throw new AppError(404, ERROR_MESSAGES.SERVICE_ITEM.NOT_FOUND)

    // Verificar que no existe ya un arancel para esa combinación en esa fecha
    const validFrom = new Date(dto.validFrom)
    const duplicate = await this.insurerRateRepository.findDuplicate(
      healthInsurerId,
      dto.serviceItemId,
      validFrom
    )
    if (duplicate) throw new AppError(409, ERROR_MESSAGES.INSURER_RATE.ALREADY_EXISTS)

    const rate = await this.insurerRateRepository.create({
      healthInsurerId,
      serviceItemId:   dto.serviceItemId,
      agreedPrice:     dto.agreedPrice,
      validFrom,
      validTo:         dto.validTo ? new Date(dto.validTo) : null,
      active:          dto.active,
    })

    return InsurerRateMapper.toDto(rate)
  }
}
