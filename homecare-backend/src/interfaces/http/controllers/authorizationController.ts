import type { Request, Response } from 'express'
import { AuthorizationRepository } from '../../../infrastructure/database/repositories/authorizationRepository.js'
import { InternmentRepository } from '../../../infrastructure/database/repositories/internmentRepository.js'
import { CreateAuthorizationUseCase } from '../../../application/useCases/authorization/createAuthorizationUseCase.js'
import { ListAuthorizationsUseCase } from '../../../application/useCases/authorization/listAuthorizationsUseCase.js'
import { GetAuthorizationUseCase } from '../../../application/useCases/authorization/getAuthorizationUseCase.js'
import { UpdateAuthorizationStatusUseCase } from '../../../application/useCases/authorization/updateAuthorizationStatusUseCase.js'
import { sendOk, sendCreated } from '../../../shared/helpers/responseHelper.js'
import { SUCCESS_MESSAGES } from '../../../shared/constants/messages.js'
import type { CreateAuthorizationDto, UpdateAuthorizationStatusDto } from '../schemas/authorizationSchema.js'

export class AuthorizationController {
  private readonly authorizationRepo = new AuthorizationRepository()
  private readonly internmentRepo    = new InternmentRepository()

  list = async (req: Request, res: Response): Promise<void> => {
    const result = await new ListAuthorizationsUseCase(this.authorizationRepo, this.internmentRepo)
      .execute(req.params['internmentId'] as string)
    sendOk(res, SUCCESS_MESSAGES.AUTHORIZATION.LIST, result)
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    const result = await new GetAuthorizationUseCase(this.authorizationRepo)
      .execute(req.params['authorizationId'] as string, req.params['internmentId'] as string)
    sendOk(res, SUCCESS_MESSAGES.AUTHORIZATION.FOUND, result)
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const result = await new CreateAuthorizationUseCase(this.authorizationRepo, this.internmentRepo)
      .execute(req.params['internmentId'] as string, req.body as CreateAuthorizationDto)
    sendCreated(res, SUCCESS_MESSAGES.AUTHORIZATION.CREATED, result)
  }

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    const result = await new UpdateAuthorizationStatusUseCase(this.authorizationRepo, this.internmentRepo)
      .execute(
        req.params['internmentId'] as string,
        req.params['authorizationId'] as string,
        req.body as UpdateAuthorizationStatusDto
      )
    sendOk(res, SUCCESS_MESSAGES.AUTHORIZATION.UPDATED, result)
  }
}
