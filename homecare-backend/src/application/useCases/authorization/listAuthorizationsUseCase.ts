import type { IAuthorizationRepository } from '../../../domain/repositories/iAuthorizationRepository.js'
import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { AuthorizationMapper } from '../../../interfaces/http/mappers/authorizationMapper.js'
import type { AuthorizationResponseDto } from '../../../interfaces/http/dtos/authorizationDto.js'

export class ListAuthorizationsUseCase {
  constructor(
    private readonly authorizationRepository: IAuthorizationRepository,
    private readonly internmentRepository:    IInternmentRepository
  ) {}

  async execute(internmentId: string): Promise<AuthorizationResponseDto[]> {
    const internment = await this.internmentRepository.findById(internmentId)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    const authorizations = await this.authorizationRepository.findAllByInternment(internmentId)
    return authorizations.map(AuthorizationMapper.toDto)
  }
}
