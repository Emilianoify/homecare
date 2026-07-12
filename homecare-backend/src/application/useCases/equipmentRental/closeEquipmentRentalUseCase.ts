import { prisma } from '../../../infrastructure/database/prismaClient.js'
import type { IEquipmentRentalRepository } from '../../../domain/repositories/iEquipmentRentalRepository.js'
import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { EquipmentRentalMapper } from '../../../interfaces/http/mappers/equipmentRentalMapper.js'
import type { CloseEquipmentRentalDto } from '../../../interfaces/http/schemas/equipmentRentalSchema.js'
import type { EquipmentRentalResponseDto } from '../../../interfaces/http/dtos/equipmentRentalDto.js'

export class CloseEquipmentRentalUseCase {
  constructor(
    private readonly rentalRepository:    IEquipmentRentalRepository,
    private readonly internmentRepository: IInternmentRepository
  ) {}

  async execute(
    internmentId: string,
    rentalId:     string,
    dto:          CloseEquipmentRentalDto
  ): Promise<EquipmentRentalResponseDto> {
    const internment = await this.internmentRepository.findById(internmentId)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    const rental = await this.rentalRepository.findById(rentalId, internmentId)
    if (!rental) throw new AppError(404, ERROR_MESSAGES.EQUIPMENT_RENTAL.NOT_FOUND)

    if (rental.endDate !== null) {
      throw new AppError(409, ERROR_MESSAGES.EQUIPMENT_RENTAL.ALREADY_CLOSED)
    }

    // Cerrar rental y liberar equipo en una transacción
    const endDate = new Date(dto.endDate)

    const [updatedRental] = await prisma.$transaction([
      prisma.equipmentRental.update({
        where: { id: rentalId },
        data:  { endDate, closedReason: dto.closedReason },
      }),
      prisma.equipment.update({
        where: { id: rental.equipmentId },
        data:  { status: 'AVAILABLE' },
      }),
    ])

    return EquipmentRentalMapper.toDto({
      ...updatedRental,
      monthlyRate: Number(updatedRental.monthlyRate),
    })
  }
}
