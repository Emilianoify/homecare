import { prisma } from '../../../infrastructure/database/prismaClient.js'
import type { IEquipmentRentalRepository } from '../../../domain/repositories/iEquipmentRentalRepository.js'
import type { IInternmentRepository } from '../../../domain/repositories/iInternmentRepository.js'
import type { IEquipmentRepository } from '../../../domain/repositories/iEquipmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { EquipmentRentalMapper } from '../../../interfaces/http/mappers/equipmentRentalMapper.js'
import type { CreateEquipmentRentalDto } from '../../../interfaces/http/schemas/equipmentRentalSchema.js'
import type { EquipmentRentalResponseDto } from '../../../interfaces/http/dtos/equipmentRentalDto.js'

export class CreateEquipmentRentalUseCase {
  constructor(
    private readonly rentalRepository:    IEquipmentRentalRepository,
    private readonly internmentRepository: IInternmentRepository,
    private readonly equipmentRepository:  IEquipmentRepository
  ) {}

  async execute(
    internmentId: string,
    dto:          CreateEquipmentRentalDto,
    companyId:    string
  ): Promise<EquipmentRentalResponseDto> {
    // Verificar internación
    const internment = await this.internmentRepository.findById(internmentId)
    if (!internment) throw new AppError(404, ERROR_MESSAGES.INTERNMENT.NOT_FOUND)

    // Verificar que el equipo pertenece a la company y está disponible
    const equipment = await this.equipmentRepository.findById(dto.equipmentId, companyId)
    if (!equipment) throw new AppError(404, ERROR_MESSAGES.EQUIPMENT.NOT_FOUND)

    if (equipment.status !== 'AVAILABLE') {
      throw new AppError(409, equipment.status === 'IN_USE'
        ? ERROR_MESSAGES.EQUIPMENT_RENTAL.EQUIPMENT_IN_USE
        : ERROR_MESSAGES.EQUIPMENT_RENTAL.NOT_AVAILABLE
      )
    }

    // Verificar que no haya rental activo para este equipo
    const activeRental = await this.rentalRepository.findActiveByEquipment(dto.equipmentId)
    if (activeRental) throw new AppError(409, ERROR_MESSAGES.EQUIPMENT_RENTAL.EQUIPMENT_IN_USE)

    // Verificar autorización si se indica — debe pertenecer a la internación
    if (dto.authorizationId) {
      const auth = await this.rentalRepository.findAuthorizationByIdAndInternment(
        dto.authorizationId,
        internmentId
      )
      if (!auth) throw new AppError(404, ERROR_MESSAGES.AUTHORIZATION.NOT_FOUND)
    }

    // Crear rental y actualizar status del equipo en una transacción
    const [rental] = await prisma.$transaction([
      prisma.equipmentRental.create({
        data: {
          internmentId,
          equipmentId:     dto.equipmentId,
          authorizationId: dto.authorizationId ?? null,
          budgetId:        dto.budgetId        ?? null,
          monthlyRate:     dto.monthlyRate,
          startDate:       new Date(dto.startDate),
          endDate:         null,
          closedReason:    null,
          billedToInsurer: false,
        },
      }),
      prisma.equipment.update({
        where: { id: dto.equipmentId },
        data:  { status: 'IN_USE' },
      }),
    ])

    // Convertir monthlyRate de Decimal a number para el mapper
    return EquipmentRentalMapper.toDto({
      ...rental,
      monthlyRate: Number(rental.monthlyRate),
    })
  }
}
