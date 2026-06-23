import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { InternmentMapper } from '../../../interfaces/http/mappers/internmentMapper.js'
import type { InternmentResponseDto } from '../../../interfaces/http/dtos/internmentDto.js'

export class GetInternmentUseCase {
  constructor(private readonly internmentRepository: IInternmentRepository) {}

  async execute(id: string): Promise<InternmentResponseDto> {
    const internment = await this.internmentRepository.findById(id)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)
    return InternmentMapper.toDto(internment)
  }
}
