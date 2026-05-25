import { ApplicationError } from '../../../../shared/application/ApplicationError';
import { RefreshTokenRepository } from '../../domain/repositories/RefreshTokenRepository';
import { SessionRepository } from '../../domain/repositories/SessionRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { issueAuthenticationSession } from '../services/issueAuthenticationSession';
import { AuthenticationResult, sanitizeUser } from './RegisterUserUseCase';
import { assertActiveUser } from '../services/assertActiveUser';

export interface RefreshSessionInput {
  refreshToken: string;
}

export class RefreshSessionUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(input: RefreshSessionInput): Promise<AuthenticationResult> {
    const refreshToken = input.refreshToken?.trim();

    if (!refreshToken) {
      throw new ApplicationError('Refresh token ausente.', 401, 'REFRESH_TOKEN_MISSING');
    }

    const userId = await this.refreshTokenRepository.findUserIdByToken(refreshToken);

    if (!userId) {
      throw new ApplicationError('Refresh token expirado ou invalido.', 401, 'REFRESH_TOKEN_INVALID');
    }

    await this.refreshTokenRepository.delete(refreshToken);

    const user = await this.userRepository.findById(userId);
    assertActiveUser(user, 'REFRESH_TOKEN_USER_NOT_FOUND');

    const session = await issueAuthenticationSession(this.sessionRepository, this.refreshTokenRepository, user.id);

    return {
      ...session,
      user: sanitizeUser(user),
    };
  }
}