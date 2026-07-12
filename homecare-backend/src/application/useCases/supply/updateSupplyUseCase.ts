import type { ISupplyRepository } from '../../../domain/repositories/iSupplyRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { SupplyMapper } from '../../../interfaces/http/mappers/supplyMapper.js'
import type { UpdateSupplyDto } from '../../../interfaces/http/schemas/supplySchema.js'
import type { SupplyResponseDto } from '../../../interfaces/http/dtos/supplyDto.js'

export class UpdateSupplyUseCase {
  constructor(private readonly supplyRepository: ISupplyRepository) {}

  async execute(id: string, dto: UpdateSupplyDto, companyId: string): Promise<SupplyResponseDto> {
    const supply = await this.supplyRepository.findById(id, companyId)
    if (!supply) throw new AppError(404, ERROR_MESSAGES.SUPPLY.NOT_FOUND)

    if (dto.code && dto.code !== supply.code) {
      const existing = await this.supplyRepository.findByCode(dto.code, companyId)
      if (existing) throw new AppError(409, ERROR_MESSAGES.SUPPLY.CODE_EXISTS)
    }

    const updated = await this.supplyRepository.update(id, dto)
    return SupplyMapper.toDto(updated)
  }
}
