import type { ISupplyRepository } from '../../../domain/repositories/iSupplyRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { SupplyMapper } from '../../../interfaces/http/mappers/supplyMapper.js'
import type { SupplyResponseDto } from '../../../interfaces/http/dtos/supplyDto.js'

export class GetSupplyUseCase {
  constructor(private readonly supplyRepository: ISupplyRepository) {}

  async execute(id: string, companyId: string): Promise<SupplyResponseDto> {
    const supply = await this.supplyRepository.findById(id, companyId)
    if (!supply) throw new AppError(404, ERROR_MESSAGES.SUPPLY.NOT_FOUND)
    return SupplyMapper.toDto(supply)
  }
}
