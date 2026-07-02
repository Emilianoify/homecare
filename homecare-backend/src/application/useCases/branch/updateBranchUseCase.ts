import type { IBranchRepository } from '../../../domain/repositories/iBranchRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { BranchMapper } from '../../../interfaces/http/mappers/branchMapper.js'
import type { UpdateBranchDto } from '../../../interfaces/http/schemas/branchSchema.js'
import type { BranchResponseDto } from '../../../interfaces/http/dtos/branchDto.js'

export class UpdateBranchUseCase {
  constructor(private readonly branchRepository: IBranchRepository) {}

  async execute(id: string, dto: UpdateBranchDto, companyId: string): Promise<BranchResponseDto> {
    const branch = await this.branchRepository.findById(id, companyId)
    if (!branch) throw new AppError(404, ERROR_MESSAGES.BRANCH.NOT_FOUND)

    const updated = await this.branchRepository.update(id, dto)
    return BranchMapper.toDto(updated)
  }
}
