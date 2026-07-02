import type { IBranchRepository } from '../../../domain/repositories/iBranchRepository.js'
import { BranchMapper } from '../../../interfaces/http/mappers/branchMapper.js'
import type { BranchResponseDto } from '../../../interfaces/http/dtos/branchDto.js'

export class ListBranchesUseCase {
  constructor(private readonly branchRepository: IBranchRepository) {}

  async execute(companyId: string): Promise<BranchResponseDto[]> {
    const branches = await this.branchRepository.findAll(companyId)
    return branches.map(item => BranchMapper.toDto(item))
  }
}
