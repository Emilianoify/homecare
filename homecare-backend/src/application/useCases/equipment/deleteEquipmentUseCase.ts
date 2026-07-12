import type { IEquipmentRepository } from '../../../domain/repositories/iEquipmentRepository.js'
import { AppError } from '../../../shared/errors/AppError.js'
import { ERROR_MESSAGES } from '../../../shared/constants/messages.js'

export class DeleteEquipmentUseCase {
  constructor(private readonly equipmentRepository: IEquipmentRepository) {}

  async execute(id: string, companyId: string): Promise<void> {
    const equipment = await this.equipmentRepository.findById(id, companyId)
    if (!equipment) throw new AppError(404, ERROR_MESSAGES.EQUIPMENT.NOT_FOUND)

    if (equipment.status === 'IN_USE') {
      throw new AppError(409, ERROR_MESSAGES.EQUIPMENT.NOT_AVAILABLE)
    }

    await this.equipmentRepository.softDelete(id)
  }
}
