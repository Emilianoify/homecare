import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { InternmentMapper } from '../../../interfaces/http/mappers/internmentMapper.js'
import type { InternmentQuery } from '../../../interfaces/http/schemas/internmentSchema.js'
import type { InternmentListResultDto } from '../../../interfaces/http/dtos/internmentDto.js'

export class ListInternmentsUseCase {
  constructor(private readonly internmentRepository: IInternmentRepository) {}

  async execute(query: InternmentQuery): Promise<InternmentListResultDto> {
    const { items, total } = await this.internmentRepository.findAll(query)

    return {
      items:      items.map(InternmentMapper.toDto),
      page:       query.page,
      limit:      query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    }
  }
}
