import { RefreshTokenRepository } from '../../domain/repositories/RefreshTokenRepository';
import { SessionRepository } from '../../domain/repositories/SessionRepository';

export class LogoutSessionUseCase {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(accessToken?: string | null, refreshToken?: string | null) {
    if (accessToken) {
      await this.sessionRepository.delete(accessToken);
    }

    if (refreshToken) {
      await this.refreshTokenRepository.delete(refreshToken);
    }
  }
}