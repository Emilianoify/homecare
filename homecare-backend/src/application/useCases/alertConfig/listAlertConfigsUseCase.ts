import type { IAlertConfigRepository } from '../../../domain/repositories/iAlertConfigRepository.js'
import { AlertConfigMapper } from '../../../interfaces/http/mappers/alertConfigMapper.js'
import type { AlertConfigQuery } from '../../../interfaces/http/schemas/alertConfigSchema.js'
import type { AlertConfigResponseDto } from '../../../interfaces/http/dtos/alertConfigDto.js'

export class ListAlertConfigsUseCase {
  constructor(private readonly alertConfigRepository: IAlertConfigRepository) {}

  async execute(companyId: string, query: AlertConfigQuery): Promise<AlertConfigResponseDto[]> {
    const configs = await this.alertConfigRepository.findAll(companyId, query.onlyActive)
    return configs.map(AlertConfigMapper.toDto)
  }
}
