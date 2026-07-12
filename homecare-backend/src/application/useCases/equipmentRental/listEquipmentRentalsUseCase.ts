import type { IEquipmentRentalRepository } from '../../../domain/repositories/iEquipmentRentalRepository.js'
import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { EquipmentRentalMapper } from '../../../interfaces/http/mappers/equipmentRentalMapper.js'
import type { EquipmentRentalQuery } from '../../../interfaces/http/schemas/equipmentRentalSchema.js'
import type { EquipmentRentalResponseDto } from '../../../interfaces/http/dtos/equipmentRentalDto.js'

export class ListEquipmentRentalsUseCase {
  constructor(
    private readonly rentalRepository:    IEquipmentRentalRepository,
    private readonly internmentRepository: IInternmentRepository
  ) {}

  async execute(
    internmentId: string,
    query:        EquipmentRentalQuery
  ): Promise<EquipmentRentalResponseDto[]> {
    const internment = await this.internmentRepository.findById(internmentId)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    const rentals = await this.rentalRepository.findAll({
      internmentId,
      onlyActive: query.onlyActive,
    })

    return rentals.map(EquipmentRentalMapper.toDto)
  }
}
