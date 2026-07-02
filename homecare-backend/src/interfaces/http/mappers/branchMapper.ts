import type { BranchEntity } from '../../../domain/entities/branchEntity.js'
import type { BranchResponseDto } from '../dtos/branchDto.js'

export class BranchMapper {
  static toDto(branch: BranchEntity): BranchResponseDto {
    return {
      id:        branch.id,
      companyId: branch.companyId,
      name:      branch.name,
      address:   branch.address,
      city:      branch.city,
      phone:     branch.phone,
      active:    branch.active,
      createdAt: branch.createdAt.toISOString(),
    }
  }
}
