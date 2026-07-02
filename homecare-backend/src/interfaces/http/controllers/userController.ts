import type { Request, Response } from 'express'
import { UserManagementRepository } from '../../../infrastructure/database/repositories/userManagementRepository.js'
import { CreateUserUseCase } from '../../../application/useCases/user/createUserUseCase.js'
import { GetUserUseCase } from '../../../application/useCases/user/getUserUseCase.js'
import { ListUsersUseCase } from '../../../application/useCases/user/listUsersUseCase.js'
import { UpdateUserUseCase } from '../../../application/useCases/user/updateUserUseCase.js'
import { DeleteUserUseCase } from '../../../application/useCases/user/deleteUserUseCase.js'
import { ChangePasswordUseCase } from '../../../application/useCases/user/changePasswordUseCase.js'
import { sendOk, sendCreated, sendNoContent } from '../../../shared/helpers/responseHelper.js'
import { SUCCESS_MESSAGES } from '../../../shared/constants/messages.js'
import type { CreateUserDto, UpdateUserDto, ChangePasswordDto, UserQuery } from '../schemas/userSchema.js'

export class UserController {
  private readonly repo = new UserManagementRepository()

  list = async (req: Request, res: Response): Promise<void> => {
    const query  = req.query as unknown as UserQuery
    const result = await new ListUsersUseCase(this.repo).execute(query, req.user!.companyId)
    sendOk(res, SUCCESS_MESSAGES.USER.LIST, result)
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    const result = await new GetUserUseCase(this.repo).execute(
      req.params['id'] as string,
      req.user!.companyId
    )
    sendOk(res, SUCCESS_MESSAGES.USER.FOUND, result)
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const result = await new CreateUserUseCase(this.repo).execute(
      req.body as CreateUserDto,
      req.user!.companyId
    )
    sendCreated(res, SUCCESS_MESSAGES.USER.CREATED, result)
  }

  update = async (req: Request, res: Response): Promise<void> => {
    const result = await new UpdateUserUseCase(this.repo).execute(
      req.params['id'] as string,
      req.body as UpdateUserDto,
      req.user!.companyId
    )
    sendOk(res, SUCCESS_MESSAGES.USER.UPDATED, result)
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    await new DeleteUserUseCase(this.repo).execute(
      req.params['id'] as string,
      req.user!.companyId,
      req.user!.userId
    )
    sendNoContent(res)
  }

  changePassword = async (req: Request, res: Response): Promise<void> => {
    await new ChangePasswordUseCase(this.repo).execute(
      req.params['id'] as string,
      req.body as ChangePasswordDto,
      req.user!.companyId
    )
    sendOk(res, SUCCESS_MESSAGES.USER.PASSWORD_CHANGED)
  }
}
