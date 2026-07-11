import type { AuthorizationEntity } from '../entities/authorizationEntity.js'

export interface IAuthorizationRepository {
  findAllByInternment(internmentId: string): Promise<AuthorizationEntity[]>
  findById(id: string, internmentId: string): Promise<AuthorizationEntity | null>
  create(data: Omit<AuthorizationEntity, 'id' | 'createdAt'>): Promise<AuthorizationEntity>
  updateStatus(id: string, status: string): Promise<AuthorizationEntity>
}
