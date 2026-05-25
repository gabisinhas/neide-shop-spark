import { SessionTokenService } from '../../../../shared/security/SessionTokenService';
import { OAuthLoginResultPayload, OAuthLoginResultRepository } from '../../domain/repositories/OAuthLoginResultRepository';

export class CreateOAuthLoginResultUseCase {
  constructor(private readonly repository: OAuthLoginResultRepository) {}

  async execute(payload: OAuthLoginResultPayload) {
    const token = SessionTokenService.generate();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await this.repository.create({
      token,
      payload,
      expiresAt,
    });

    return { token, expiresAt };
  }
}