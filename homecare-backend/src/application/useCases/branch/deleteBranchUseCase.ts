import type { IBranchRepository } from '../../../domain/repositories/iBranchRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

export class DeleteBranchUseCase {
  constructor(private readonly branchRepository: IBranchRepository) {}

  async execute(id: string, companyId: string): Promise<void> {
    const branch = await this.branchRepository.findById(id, companyId)
    if (!branch) throw new AppError(404, ERROR_MESSAGES.BRANCH.NOT_FOUND)
    await this.branchRepository.softDelete(id)
  }
}
