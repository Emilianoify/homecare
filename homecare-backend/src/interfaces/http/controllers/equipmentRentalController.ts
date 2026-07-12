import type { Request, Response } from 'express'
import { EquipmentRentalRepository } from '../../../infrastructure/database/repositories/equipmentRentalRepository.js'
import { InternmentRepository } from '../../../infrastructure/database/repositories/internmentRepository.js'
import { EquipmentRepository } from '../../../infrastructure/database/repositories/equipmentRepository.js'
import { CreateEquipmentRentalUseCase } from '../../../application/useCases/equipmentRental/createEquipmentRentalUseCase.js'
import { ListEquipmentRentalsUseCase } from '../../../application/useCases/equipmentRental/listEquipmentRentalsUseCase.js'
import { GetEquipmentRentalUseCase } from '../../../application/useCases/equipmentRental/getEquipmentRentalUseCase.js'
import { CloseEquipmentRentalUseCase } from '../../../application/useCases/equipmentRental/closeEquipmentRentalUseCase.js'
import { sendOk, sendCreated } from '../../../shared/helpers/responseHelper.js'
import { SUCCESS_MESSAGES } from '../../../shared/constants/messages.js'
import type {
  CreateEquipmentRentalDto,
  CloseEquipmentRentalDto,
  EquipmentRentalQuery,
} from '../schemas/equipmentRentalSchema.js'

export class EquipmentRentalController {
  private readonly rentalRepo    = new EquipmentRentalRepository()
  private readonly internmentRepo = new InternmentRepository()
  private readonly equipmentRepo  = new EquipmentRepository()

  list = async (req: Request, res: Response): Promise<void> => {
    const query  = req.query as unknown as EquipmentRentalQuery
    const result = await new ListEquipmentRentalsUseCase(this.rentalRepo, this.internmentRepo)
      .execute(req.params['internmentId'] as string, query)
    sendOk(res, SUCCESS_MESSAGES.EQUIPMENT_RENTAL.LIST, result)
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    const result = await new GetEquipmentRentalUseCase(this.rentalRepo)
      .execute(req.params['rentalId'] as string, req.params['internmentId'] as string)
    sendOk(res, SUCCESS_MESSAGES.EQUIPMENT_RENTAL.FOUND, result)
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const result = await new CreateEquipmentRentalUseCase(
      this.rentalRepo,
      this.internmentRepo,
      this.equipmentRepo
    ).execute(
      req.params['internmentId'] as string,
      req.body as CreateEquipmentRentalDto,
      req.user!.companyId
    )
    sendCreated(res, SUCCESS_MESSAGES.EQUIPMENT_RENTAL.CREATED, result)
  }

  close = async (req: Request, res: Response): Promise<void> => {
    const result = await new CloseEquipmentRentalUseCase(this.rentalRepo, this.internmentRepo)
      .execute(
        req.params['internmentId'] as string,
        req.params['rentalId'] as string,
        req.body as CloseEquipmentRentalDto
      )
    sendOk(res, SUCCESS_MESSAGES.EQUIPMENT_RENTAL.CLOSED, result)
  }
}
