import type { IUserRepository } from '../../../domain/repositories/iUserRepository.js'

export class LogoutUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, token: string): Promise<void> {
    await this.userRepository.revokeRefreshToken(userId, token)
  }
}
