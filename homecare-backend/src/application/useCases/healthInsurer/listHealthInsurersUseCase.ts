import type { IHealthInsurerRepository } from '../../../domain/repositories/iHealthInsurerRepository.js'
import { HealthInsurerMapper } from '../../../interfaces/http/mappers/healthInsurerMapper.js'
import type { HealthInsurerQuery } from '../../../interfaces/http/schemas/healthInsurerSchema.js'
import type { HealthInsurerListResultDto } from '../../../interfaces/http/dtos/healthInsurerDto.js'

export class ListHealthInsurersUseCase {
  constructor(private readonly healthInsurerRepository: IHealthInsurerRepository) {}

  async execute(query: HealthInsurerQuery, companyId: string): Promise<HealthInsurerListResultDto> {
    const { items, total } = await this.healthInsurerRepository.findAll({ ...query, companyId })

    return {
      items:      items.map(item => HealthInsurerMapper.toDto(item)),
      page:       query.page,
      limit:      query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    }
  }
}
