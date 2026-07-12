import type { ISupplyRepository } from '../../../domain/repositories/iSupplyRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

export class DeleteSupplyUseCase {
  constructor(private readonly supplyRepository: ISupplyRepository) {}

  async execute(id: string, companyId: string): Promise<void> {
    const supply = await this.supplyRepository.findById(id, companyId)
    if (!supply) throw new AppError(404, ERROR_MESSAGES.SUPPLY.NOT_FOUND)
    await this.supplyRepository.softDelete(id)
  }
}
