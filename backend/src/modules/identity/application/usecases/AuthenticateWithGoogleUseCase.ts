import { randomUUID } from 'node:crypto';
import { issueAuthenticationSession } from '../services/issueAuthenticationSession';
import { PublicUser, User } from '../../domain/entities/User';
import { RefreshTokenRepository } from '../../domain/repositories/RefreshTokenRepository';
import { SessionRepository } from '../../domain/repositories/SessionRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { GoogleTokenVerifier } from '../../infra/google/GoogleTokenVerifier';
import { sanitizeUser } from './RegisterUserUseCase';
import { assertUserNotDeactivated } from '../services/assertActiveUser';

export interface AuthenticateWithGoogleInput {
  credential: string;
}

export interface AuthenticateWithGoogleResult {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}

export class AuthenticateWithGoogleUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly googleTokenVerifier: GoogleTokenVerifier,
  ) {}

  async execute(input: AuthenticateWithGoogleInput): Promise<AuthenticateWithGoogleResult> {
    const googleIdentity = await this.googleTokenVerifier.verify(input.credential);
    const existingUser = await this.userRepository.findByEmail(googleIdentity.email);

    assertUserNotDeactivated(existingUser, 'GOOGLE_USER_DEACTIVATED');

    const user: User = existingUser
      ? await this.userRepository.update({
          ...existingUser,
          name: googleIdentity.name,
          email: googleIdentity.email,
          provider: 'google',
        })
      : await this.userRepository.create({
          id: randomUUID(),
          name: googleIdentity.name,
          email: googleIdentity.email,
          provider: 'google',
          role: 'customer',
          createdAt: new Date().toISOString(),
        });

    const session = await issueAuthenticationSession(this.sessionRepository, this.refreshTokenRepository, user.id);

    return {
      ...session,
      user: sanitizeUser(user),
    };
  }
}