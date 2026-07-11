import type { IAuthorizationRepository } from '../../../domain/repositories/iAuthorizationRepository.js'
import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { AuthorizationMapper } from '../../../interfaces/http/mappers/authorizationMapper.js'
import type { CreateAuthorizationDto } from '../../../interfaces/http/schemas/authorizationSchema.js'
import type { AuthorizationResponseDto } from '../../../interfaces/http/dtos/authorizationDto.js'

export class CreateAuthorizationUseCase {
  constructor(
    private readonly authorizationRepository: IAuthorizationRepository,
    private readonly internmentRepository:    IInternmentRepository
  ) {}

  async execute(
    internmentId: string,
    dto: CreateAuthorizationDto
  ): Promise<AuthorizationResponseDto> {
    const internment = await this.internmentRepository.findById(internmentId)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    const authorization = await this.authorizationRepository.create({
      internmentId,
      healthInsurerId:   dto.healthInsurerId,
      number:            dto.number,
      opNumber:          dto.opNumber ?? null,
      type:              dto.type,
      validFrom:         new Date(dto.validFrom),
      validTo:           new Date(dto.validTo),
      authorizedModules: dto.authorizedModules,
      status:            'PENDING',
      notes:             dto.notes ?? null,
    })

    return AuthorizationMapper.toDto(authorization)
  }
}
