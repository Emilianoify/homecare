import type { IEquipmentRepository } from '../../../domain/repositories/iEquipmentRepository.js'
import type { IBranchRepository } from '../../../domain/repositories/iBranchRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'
import { EquipmentMapper } from '../../../interfaces/http/mappers/equipmentMapper.js'
import type { CreateEquipmentDto } from '../../../interfaces/http/schemas/equipmentSchema.js'
import type { EquipmentResponseDto } from '../../../interfaces/http/dtos/equipmentDto.js'

export class CreateEquipmentUseCase {
  constructor(
    private readonly equipmentRepository: IEquipmentRepository,
    private readonly branchRepository:    IBranchRepository
  ) {}

  async execute(dto: CreateEquipmentDto, companyId: string): Promise<EquipmentResponseDto> {
    // Verificar que la sucursal pertenece a la company — ownership
    const branch = await this.branchRepository.findById(dto.branchId, companyId)
    if (!branch) throw new AppError(404, ERROR_MESSAGES.BRANCH.NOT_FOUND)

    const equipment = await this.equipmentRepository.create({
      companyId,
      branchId:     dto.branchId,
      provider:     dto.provider,
      name:         dto.name,
      serialNumber: dto.serialNumber  ?? null,
      model:        dto.model         ?? null,
      dailyRate:    dto.dailyRate,
      status:       'AVAILABLE',
      notes:        dto.notes         ?? null,
    })

    return EquipmentMapper.toDto(equipment)
  }
}
