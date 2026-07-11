import type { IAuthorizationRepository } from '../../../domain/repositories/iAuthorizationRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { AuthorizationMapper } from '../../../interfaces/http/mappers/authorizationMapper.js'
import type { AuthorizationResponseDto } from '../../../interfaces/http/dtos/authorizationDto.js'

export class GetAuthorizationUseCase {
  constructor(private readonly authorizationRepository: IAuthorizationRepository) {}

  async execute(id: string, internmentId: string): Promise<AuthorizationResponseDto> {
    const authorization = await this.authorizationRepository.findById(id, internmentId)
    if (!authorization) throw new AppError(404, ERROR_MESSAGES.AUTHORIZATION.NOT_FOUND)
    return AuthorizationMapper.toDto(authorization)
  }
}
