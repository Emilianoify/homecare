import type { ISupplyRepository } from '../../../domain/repositories/iSupplyRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { SupplyMapper } from '../../../interfaces/http/mappers/supplyMapper.js'
import type { CreateSupplyDto } from '../../../interfaces/http/schemas/supplySchema.js'
import type { SupplyResponseDto } from '../../../interfaces/http/dtos/supplyDto.js'

export class CreateSupplyUseCase {
  constructor(private readonly supplyRepository: ISupplyRepository) {}

  async execute(dto: CreateSupplyDto, companyId: string): Promise<SupplyResponseDto> {
    // Código único dentro de la misma company
    if (dto.code) {
      const existing = await this.supplyRepository.findByCode(dto.code, companyId)
      if (existing) throw new AppError(409, ERROR_MESSAGES.SUPPLY.CODE_EXISTS)
    }

    const supply = await this.supplyRepository.create({
      companyId,
      code:          dto.code          ?? null,
      name:          dto.name,
      unit:          dto.unit,
      purchasePrice: dto.purchasePrice,
      active:        dto.active,
    })

    return SupplyMapper.toDto(supply)
  }
}
