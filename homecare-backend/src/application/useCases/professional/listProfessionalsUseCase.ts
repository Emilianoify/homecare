import type { IProfessionalRepository } from '../../../domain/repositories/iProfessionalRepository.js'
import { ProfessionalMapper } from '../../../interfaces/http/mappers/professionalMapper.js'
import type { ProfessionalQuery } from '../../../interfaces/http/schemas/professionalSchema.js'
import type { ProfessionalListResultDto } from '../../../interfaces/http/dtos/professionalDto.js'

export class ListProfessionalsUseCase {
  constructor(private readonly professionalRepository: IProfessionalRepository) {}

  async execute(query: ProfessionalQuery, companyId: string): Promise<ProfessionalListResultDto> {
    const { items, total } = await this.professionalRepository.findAll({ ...query, companyId })

    return {
      items:      items.map(ProfessionalMapper.toDto),
      page:       query.page,
      limit:      query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    }
  }
}
