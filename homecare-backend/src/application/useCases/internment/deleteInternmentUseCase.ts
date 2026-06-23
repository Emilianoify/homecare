import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

export class DeleteInternmentUseCase {
  constructor(private readonly internmentRepository: IInternmentRepository) {}

  async execute(id: string): Promise<void> {
    const internment = await this.internmentRepository.findById(id)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)
    await this.internmentRepository.softDelete(id)
  }
}
