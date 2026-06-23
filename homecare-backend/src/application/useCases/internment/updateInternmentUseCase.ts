import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { InternmentMapper } from '../../../interfaces/http/mappers/internmentMapper.js'
import type { UpdateInternmentDto } from '../../../interfaces/http/schemas/internmentSchema.js'
import type { InternmentResponseDto } from '../../../interfaces/http/dtos/internmentDto.js'

export class UpdateInternmentUseCase {
  constructor(private readonly internmentRepository: IInternmentRepository) {}

  async execute(id: string, dto: UpdateInternmentDto): Promise<InternmentResponseDto> {
    const internment = await this.internmentRepository.findById(id)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    const { admissionDate, omeDate, medicalFamilyAgreementDate, ...rest } = dto
    const updated = await this.internmentRepository.update(id, {
      ...rest,
      ...(admissionDate              && { admissionDate:              new Date(admissionDate) }),
      ...(omeDate                    && { omeDate:                    new Date(omeDate) }),
      ...(medicalFamilyAgreementDate && { medicalFamilyAgreementDate: new Date(medicalFamilyAgreementDate) }),
    })

    return InternmentMapper.toDto(updated)
  }
}
