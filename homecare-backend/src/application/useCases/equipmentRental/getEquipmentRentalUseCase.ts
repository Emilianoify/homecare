import type { IEquipmentRentalRepository } from '../../../domain/repositories/iEquipmentRentalRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { EquipmentRentalMapper } from '../../../interfaces/http/mappers/equipmentRentalMapper.js'
import type { EquipmentRentalResponseDto } from '../../../interfaces/http/dtos/equipmentRentalDto.js'

export class GetEquipmentRentalUseCase {
  constructor(private readonly rentalRepository: IEquipmentRentalRepository) {}

  async execute(id: string, internmentId: string): Promise<EquipmentRentalResponseDto> {
    const rental = await this.rentalRepository.findById(id, internmentId)
    if (!rental) throw new AppError(404, ERROR_MESSAGES.EQUIPMENT_RENTAL.NOT_FOUND)
    return EquipmentRentalMapper.toDto(rental)
  }
}
