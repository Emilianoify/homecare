import type { IProfessionalRepository } from '../../../domain/repositories/iProfessionalRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

export class DeleteProfessionalUseCase {
  constructor(private readonly professionalRepository: IProfessionalRepository) {}

  async execute(id: string, companyId: string): Promise<void> {
    const professional = await this.professionalRepository.findById(id, companyId)
    if (!professional) throw new AppError(404, ERROR_MESSAGES.PROFESSIONAL.NOT_FOUND)
    await this.professionalRepository.softDelete(id)
  }
}
