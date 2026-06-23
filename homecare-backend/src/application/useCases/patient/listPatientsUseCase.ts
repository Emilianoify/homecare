import type { IPatientRepository } from '../../../domain/repositories/iPatientRepository.js'
import { PatientMapper } from '../../../interfaces/http/mappers/patientMapper.js'
import type { PatientQuery } from '../../../interfaces/http/schemas/patientSchema.js'
import type { PatientListResultDto } from '../../../interfaces/http/dtos/patientDto.js'

export class ListPatientsUseCase {
  constructor(private readonly patientRepository: IPatientRepository) {}

  async execute(query: PatientQuery, companyId: string): Promise<PatientListResultDto> {
    const { items, total } = await this.patientRepository.findAll({ ...query, companyId })

    return {
      items:      items.map(PatientMapper.toDto),
      page:       query.page,
      limit:      query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    }
  }
}
