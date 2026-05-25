import { SessionTokenService } from '../../../../shared/security/SessionTokenService';
import { RefreshTokenRepository } from '../../domain/repositories/RefreshTokenRepository';
import { SessionRepository } from '../../domain/repositories/SessionRepository';

export interface IssuedAuthenticationSession {
  accessToken: string;
  refreshToken: string;
}

export async function issueAuthenticationSession(
  sessionRepository: SessionRepository,
  refreshTokenRepository: RefreshTokenRepository,
  userId: string,
) {
  const accessToken = SessionTokenService.generate();
  const refreshToken = SessionTokenService.generate();

  await sessionRepository.create({ token: accessToken, userId });
  await refreshTokenRepository.create({
    token: refreshToken,
    userId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });

  return {
    accessToken,
    refreshToken,
  } satisfies IssuedAuthenticationSession;
}