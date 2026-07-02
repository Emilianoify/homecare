import type { Request, Response } from 'express'
import { BranchRepository } from '../../../infrastructure/database/repositories/branchRepository.js'
import { CreateBranchUseCase } from '../../../application/useCases/branch/createBranchUseCase.js'
import { GetBranchUseCase } from '../../../application/useCases/branch/getBranchUseCase.js'
import { ListBranchesUseCase } from '../../../application/useCases/branch/listBranchesUseCase.js'
import { UpdateBranchUseCase } from '../../../application/useCases/branch/updateBranchUseCase.js'
import { DeleteBranchUseCase } from '../../../application/useCases/branch/deleteBranchUseCase.js'
import { sendOk, sendCreated, sendNoContent } from '../../../shared/helpers/responseHelper.js'
import { SUCCESS_MESSAGES } from '../../../shared/constants/messages.js'
import type { CreateBranchDto, UpdateBranchDto } from '../schemas/branchSchema.js'

export class BranchController {
  private readonly repo = new BranchRepository()

  list = async (req: Request, res: Response): Promise<void> => {
    const result = await new ListBranchesUseCase(this.repo).execute(req.user!.companyId)
    sendOk(res, SUCCESS_MESSAGES.BRANCH.LIST, result)
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    const result = await new GetBranchUseCase(this.repo).execute(
      req.params['id'] as string,
      req.user!.companyId
    )
    sendOk(res, SUCCESS_MESSAGES.BRANCH.FOUND, result)
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const result = await new CreateBranchUseCase(this.repo).execute(
      req.body as CreateBranchDto,
      req.user!.companyId
    )
    sendCreated(res, SUCCESS_MESSAGES.BRANCH.CREATED, result)
  }

  update = async (req: Request, res: Response): Promise<void> => {
    const result = await new UpdateBranchUseCase(this.repo).execute(
      req.params['id'] as string,
      req.body as UpdateBranchDto,
      req.user!.companyId
    )
    sendOk(res, SUCCESS_MESSAGES.BRANCH.UPDATED, result)
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    await new DeleteBranchUseCase(this.repo).execute(
      req.params['id'] as string,
      req.user!.companyId
    )
    sendNoContent(res)
  }
}
