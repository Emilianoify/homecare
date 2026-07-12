import type { IEquipmentRepository } from '../../../domain/repositories/iEquipmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { EquipmentMapper } from '../../../interfaces/http/mappers/equipmentMapper.js'
import type { EquipmentResponseDto } from '../../../interfaces/http/dtos/equipmentDto.js'

export class RequestMaintenanceUseCase {
  constructor(private readonly equipmentRepository: IEquipmentRepository) {}

  async execute(id: string, companyId: string): Promise<EquipmentResponseDto> {
    const equipment = await this.equipmentRepository.findById(id, companyId)
    if (!equipment) throw new AppError(404, ERROR_MESSAGES.EQUIPMENT.NOT_FOUND)

    if (equipment.status === 'MAINTENANCE_REQUESTED') {
      throw new AppError(409, ERROR_MESSAGES.EQUIPMENT.ALREADY_IN_MAINTENANCE)
    }

    if (equipment.status === 'IN_USE') {
      throw new AppError(409, ERROR_MESSAGES.EQUIPMENT.NOT_AVAILABLE)
    }

    const updated = await this.equipmentRepository.updateStatus(id, 'MAINTENANCE_REQUESTED')
    return EquipmentMapper.toDto(updated)
  }
}
