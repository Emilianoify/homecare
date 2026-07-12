import type { IEquipmentRepository } from '../../../domain/repositories/iEquipmentRepository.js'
import type { IBranchRepository } from '../../../domain/repositories/iBranchRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { EquipmentMapper } from '../../../interfaces/http/mappers/equipmentMapper.js'
import type { UpdateEquipmentDto } from '../../../interfaces/http/schemas/equipmentSchema.js'
import type { EquipmentResponseDto } from '../../../interfaces/http/dtos/equipmentDto.js'

export class UpdateEquipmentUseCase {
  constructor(
    private readonly equipmentRepository: IEquipmentRepository,
    private readonly branchRepository:    IBranchRepository
  ) {}

  async execute(id: string, dto: UpdateEquipmentDto, companyId: string): Promise<EquipmentResponseDto> {
    const equipment = await this.equipmentRepository.findById(id, companyId)
    if (!equipment) throw new AppError(404, ERROR_MESSAGES.EQUIPMENT.NOT_FOUND)

    // Si se cambia la sucursal, verificar que pertenece a la company
    if (dto.branchId && dto.branchId !== equipment.branchId) {
      const branch = await this.branchRepository.findById(dto.branchId, companyId)
      if (!branch) throw new AppError(404, ERROR_MESSAGES.BRANCH.NOT_FOUND)
    }

    const updated = await this.equipmentRepository.update(id, {
      branchId:     dto.branchId,
      provider:     dto.provider,
      name:         dto.name,
      model:        dto.model,
      serialNumber: dto.serialNumber,
      dailyRate:    dto.dailyRate,
      notes:        dto.notes,
    })
    return EquipmentMapper.toDto(updated)
  }
}
