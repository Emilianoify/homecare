import type { IProfessionalRepository } from '../../../domain/repositories/iProfessionalRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { ProfessionalMapper } from '../../../interfaces/http/mappers/professionalMapper.js'
import type { ProfessionalDetailDto } from '../../../interfaces/http/dtos/professionalDto.js'

export class GetProfessionalUseCase {
  constructor(private readonly professionalRepository: IProfessionalRepository) {}

  async execute(id: string, companyId: string): Promise<ProfessionalDetailDto> {
    const professional = await this.professionalRepository.findById(id, companyId)
    if (!professional) throw new AppError(404, ERROR_MESSAGES.PROFESSIONAL.NOT_FOUND)
    return ProfessionalMapper.toDetailDto(professional)
  }
}
