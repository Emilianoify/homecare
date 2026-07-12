import type { Request, Response } from 'express'
import { EquipmentRepository } from '../../../infrastructure/database/repositories/equipmentRepository.js'
import { BranchRepository } from '../../../infrastructure/database/repositories/branchRepository.js'
import { CreateEquipmentUseCase } from '../../../application/useCases/equipment/createEquipmentUseCase.js'
import { GetEquipmentUseCase } from '../../../application/useCases/equipment/getEquipmentUseCase.js'
import { ListEquipmentUseCase } from '../../../application/useCases/equipment/listEquipmentUseCase.js'
import { UpdateEquipmentUseCase } from '../../../application/useCases/equipment/updateEquipmentUseCase.js'
import { DeleteEquipmentUseCase } from '../../../application/useCases/equipment/deleteEquipmentUseCase.js'
import { RequestMaintenanceUseCase } from '../../../application/useCases/equipment/requestMaintenanceUseCase.js'
import { sendOk, sendCreated, sendNoContent, sendPaginated } from '../../../shared/helpers/responseHelper.js'
import { SUCCESS_MESSAGES } from '../../../shared/constants/messages.js'
import type { CreateEquipmentDto, UpdateEquipmentDto, EquipmentQuery } from '../schemas/equipmentSchema.js'

export class EquipmentController {
  private readonly equipmentRepo = new EquipmentRepository()
  private readonly branchRepo    = new BranchRepository()

  list = async (req: Request, res: Response): Promise<void> => {
    const query  = req.query as unknown as EquipmentQuery
    const result = await new ListEquipmentUseCase(this.equipmentRepo)
      .execute(query, req.user!.companyId)
    sendPaginated(res, SUCCESS_MESSAGES.EQUIPMENT.LIST, result.items, {
      page:       result.page,
      limit:      result.limit,
      total:      result.total,
      totalPages: result.totalPages,
    })
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    const result = await new GetEquipmentUseCase(this.equipmentRepo)
      .execute(req.params['id'] as string, req.user!.companyId)
    sendOk(res, SUCCESS_MESSAGES.EQUIPMENT.FOUND, result)
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const result = await new CreateEquipmentUseCase(this.equipmentRepo, this.branchRepo)
      .execute(req.body as CreateEquipmentDto, req.user!.companyId)
    sendCreated(res, SUCCESS_MESSAGES.EQUIPMENT.CREATED, result)
  }

  update = async (req: Request, res: Response): Promise<void> => {
    const result = await new UpdateEquipmentUseCase(this.equipmentRepo, this.branchRepo)
      .execute(req.params['id'] as string, req.body as UpdateEquipmentDto, req.user!.companyId)
    sendOk(res, SUCCESS_MESSAGES.EQUIPMENT.UPDATED, result)
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    await new DeleteEquipmentUseCase(this.equipmentRepo)
      .execute(req.params['id'] as string, req.user!.companyId)
    sendNoContent(res)
  }

  requestMaintenance = async (req: Request, res: Response): Promise<void> => {
    const result = await new RequestMaintenanceUseCase(this.equipmentRepo)
      .execute(req.params['id'] as string, req.user!.companyId)
    sendOk(res, SUCCESS_MESSAGES.EQUIPMENT.MAINTENANCE_REQUESTED, result)
  }
}
