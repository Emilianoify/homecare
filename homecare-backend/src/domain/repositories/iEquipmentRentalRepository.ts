import type { EquipmentRentalEntity } from '../entities/equipmentRentalEntity.js'

export interface EquipmentRentalFilters {
  internmentId: string
  onlyActive?:  boolean
}

export interface IEquipmentRentalRepository {
  findAll(filters: EquipmentRentalFilters): Promise<EquipmentRentalEntity[]>
  findById(id: string, internmentId: string): Promise<EquipmentRentalEntity | null>
  findActiveByEquipment(equipmentId: string): Promise<EquipmentRentalEntity | null>
  findAuthorizationByIdAndInternment(authorizationId: string, internmentId: string): Promise<{ id: string } | null>
  create(data: Omit<EquipmentRentalEntity, 'id' | 'createdAt'>): Promise<EquipmentRentalEntity>
  close(id: string, endDate: Date, closedReason: string): Promise<EquipmentRentalEntity>
}
