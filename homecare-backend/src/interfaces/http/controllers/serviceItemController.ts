import type { Request, Response } from 'express'
import { ServiceItemRepository } from '../../../infrastructure/database/repositories/serviceItemRepository.js'
import { CreateServiceItemUseCase } from '../../../application/useCases/serviceItem/createServiceItemUseCase.js'
import { GetServiceItemUseCase } from '../../../application/useCases/serviceItem/getServiceItemUseCase.js'
import { ListServiceItemsUseCase } from '../../../application/useCases/serviceItem/listServiceItemsUseCase.js'
import { UpdateServiceItemUseCase } from '../../../application/useCases/serviceItem/updateServiceItemUseCase.js'
import { DeleteServiceItemUseCase } from '../../../application/useCases/serviceItem/deleteServiceItemUseCase.js'
import { sendOk, sendCreated, sendNoContent, sendPaginated } from '../../../shared/helpers/responseHelper.js'
import { SUCCESS_MESSAGES } from '../../../shared/constants/messages.js'
import type { CreateServiceItemDto, UpdateServiceItemDto, ServiceItemQuery } from '../schemas/serviceItemSchema.js'

export class ServiceItemController {
  private readonly repo = new ServiceItemRepository()

  list = async (req: Request, res: Response): Promise<void> => {
    const query  = req.query as unknown as ServiceItemQuery
    const result = await new ListServiceItemsUseCase(this.repo).execute(query)
    sendPaginated(res, SUCCESS_MESSAGES.SERVICE_ITEM.LIST, result.items, {
      page:       result.page,
      limit:      result.limit,
      total:      result.total,
      totalPages: result.totalPages,
    })
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    const result = await new GetServiceItemUseCase(this.repo).execute(req.params['id'] as string)
    sendOk(res, SUCCESS_MESSAGES.SERVICE_ITEM.FOUND, result)
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const result = await new CreateServiceItemUseCase(this.repo).execute(
      req.body as CreateServiceItemDto
    )
    sendCreated(res, SUCCESS_MESSAGES.SERVICE_ITEM.CREATED, result)
  }

  update = async (req: Request, res: Response): Promise<void> => {
    const result = await new UpdateServiceItemUseCase(this.repo).execute(
      req.params['id'] as string,
      req.body as UpdateServiceItemDto
    )
    sendOk(res, SUCCESS_MESSAGES.SERVICE_ITEM.UPDATED, result)
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    await new DeleteServiceItemUseCase(this.repo).execute(req.params['id'] as string)
    sendNoContent(res)
  }
}
