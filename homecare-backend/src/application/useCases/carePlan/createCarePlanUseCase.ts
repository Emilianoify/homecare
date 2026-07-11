import type { ICarePlanRepository } from '../../../domain/repositories/iCarePlanRepository.js'
import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import type { IProfessionalRepository } from '../../../domain/repositories/iProfessionalRepository.js'
import type { IAuthorizationRepository } from '../../../domain/repositories/iAuthorizationRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { CarePlanMapper } from '../../../interfaces/http/mappers/carePlanMapper.js'
import type { CreateCarePlanDto } from '../../../interfaces/http/schemas/carePlanSchema.js'
import type { CarePlanResponseDto } from '../../../interfaces/http/dtos/carePlanDto.js'

export class CreateCarePlanUseCase {
  constructor(
    private readonly carePlanRepository:      ICarePlanRepository,
    private readonly internmentRepository:    IInternmentRepository,
    private readonly professionalRepository:  IProfessionalRepository,
    private readonly authorizationRepository: IAuthorizationRepository
  ) {}

  async execute(
    internmentId: string,
    dto:          CreateCarePlanDto,
    companyId:    string
  ): Promise<CarePlanResponseDto> {
    // Verificar internación
    const internment = await this.internmentRepository.findById(internmentId)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    // Verificar que el profesional pertenece a la company
    const professional = await this.professionalRepository.findById(dto.professionalId, companyId)
    if (!professional) throw new AppError(404, ERROR_MESSAGES.PROFESSIONAL.NOT_FOUND)

    // Verificar que la autorización pertenece a la internación si se indica
    if (dto.authorizationId) {
      const authorization = await this.authorizationRepository.findById(
        dto.authorizationId,
        internmentId
      )
      if (!authorization) throw new AppError(404, ERROR_MESSAGES.AUTHORIZATION.NOT_FOUND)
    }

    // Verificar que no exista un plan activo para el mismo profesional y especialidad
    const existing = await this.carePlanRepository.findActiveByProfessionalAndSpecialty(
      internmentId,
      dto.professionalId,
      dto.specialty
    )
    if (existing) throw new AppError(409, ERROR_MESSAGES.CARE_PLAN.ALREADY_ACTIVE)

    const carePlan = await this.carePlanRepository.create({
      internmentId,
      professionalId:  dto.professionalId,
      authorizationId: dto.authorizationId ?? null,
      specialty:       dto.specialty,
      frequency:       dto.frequency,
      weekDays:        dto.weekDays        ?? null,
      estimatedTime:   dto.estimatedTime   ?? null,
      totalSessions:   dto.totalSessions   ?? null,
      startDate:       new Date(dto.startDate),
      endDate:         dto.endDate ? new Date(dto.endDate) : null,
      active:          true,
    })

    return CarePlanMapper.toDto(carePlan)
  }
}
