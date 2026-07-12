import type { IVisitRepository } from '../../../domain/repositories/iVisitRepository.js'
import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import type { IProfessionalRepository } from '../../../domain/repositories/iProfessionalRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { VisitMapper } from '../../../interfaces/http/mappers/visitMapper.js'
import type { CreateVisitDto } from '../../../interfaces/http/schemas/visitSchema.js'
import type { VisitResponseDto } from '../../../interfaces/http/dtos/visitDto.js'

export class CreateVisitUseCase {
  constructor(
    private readonly visitRepository:        IVisitRepository,
    private readonly internmentRepository:   IInternmentRepository,
    private readonly professionalRepository: IProfessionalRepository
  ) {}

  async execute(
    internmentId: string,
    dto:          CreateVisitDto,
    companyId:    string
  ): Promise<VisitResponseDto> {
    // Verificar que la internación existe
    const internment = await this.internmentRepository.findById(internmentId)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    // Verificar que el profesional pertenece a la company (ownership)
    const professional = await this.professionalRepository.findById(dto.professionalId, companyId)
    if (!professional) throw new AppError(404, ERROR_MESSAGES.PROFESSIONAL.NOT_FOUND)

    // Verificar que el plan de atención pertenece a la internación (ownership)
    const carePlan = await this.visitRepository.findCarePlanByIdAndInternment(
      dto.carePlanId,
      internmentId
    )
    if (!carePlan) throw new AppError(404, ERROR_MESSAGES.CARE_PLAN.NOT_FOUND)

    const visit = await this.visitRepository.create({
      carePlanId:    dto.carePlanId,
      professionalId: dto.professionalId,
      internmentId,
      completedAt:   new Date(dto.completedAt),
      status:        'COMPLETED',
      missedReason:  null,
      lat:           dto.lat  ?? null,
      lng:           dto.lng  ?? null,
      billed:        false,
      notes:         dto.notes ?? null,
    })

    return VisitMapper.toDto(visit)
  }
}
