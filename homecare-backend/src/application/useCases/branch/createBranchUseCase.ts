import type { IBranchRepository } from '../../../domain/repositories/iBranchRepository.js'
import { BranchMapper } from '../../../interfaces/http/mappers/branchMapper.js'
import type { CreateBranchDto } from '../../../interfaces/http/schemas/branchSchema.js'
import type { BranchResponseDto } from '../../../interfaces/http/dtos/branchDto.js'

export class CreateBranchUseCase {
  constructor(private readonly branchRepository: IBranchRepository) {}

  async execute(dto: CreateBranchDto, companyId: string): Promise<BranchResponseDto> {
    const branch = await this.branchRepository.create({
      companyId,
      name:    dto.name,
      address: dto.address,
      city:    dto.city    ?? null,
      phone:   dto.phone   ?? null,
      active:  dto.active,
    })

    return BranchMapper.toDto(branch)
  }
}
