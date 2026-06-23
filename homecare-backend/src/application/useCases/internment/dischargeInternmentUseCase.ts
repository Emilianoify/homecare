import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { InternmentMapper } from '../../../interfaces/http/mappers/internmentMapper.js'
import type { DischargeInternmentDto } from '../../../interfaces/http/schemas/internmentSchema.js'
import type { InternmentResponseDto } from '../../../interfaces/http/dtos/internmentDto.js'

export class DischargeInternmentUseCase {
  constructor(private readonly internmentRepository: IInternmentRepository) {}

  async execute(id: string, dto: DischargeInternmentDto): Promise<InternmentResponseDto> {
    const internment = await this.internmentRepository.findById(id)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    const updated = await this.internmentRepository.update(id, {
      dischargeDate:   new Date(dto.dischargeDate),
      dischargeReason: dto.dischargeReason,
      status:          'DISCHARGED',
    })

    return InternmentMapper.toDto(updated)
  }
}
