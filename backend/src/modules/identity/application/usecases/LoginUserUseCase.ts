import { ApplicationError } from '../../../../shared/application/ApplicationError';
import { PasswordHasher } from '../../../../shared/security/PasswordHasher';
import { issueAuthenticationSession } from '../services/issueAuthenticationSession';
import { RefreshTokenRepository } from '../../domain/repositories/RefreshTokenRepository';
import { SessionRepository } from '../../domain/repositories/SessionRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { AuthenticationResult, sanitizeUser } from './RegisterUserUseCase';
import { assertUserNotDeactivated } from '../services/assertActiveUser';

export interface LoginUserInput {
  email: string;
  password: string;
}

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(input: LoginUserInput): Promise<AuthenticationResult> {
    const email = input.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(email);

    assertUserNotDeactivated(user, 'USER_DEACTIVATED');

    if (!user?.passwordHash) {
      throw new ApplicationError('E-mail ou senha invalidos.', 401, 'INVALID_CREDENTIALS');
    }

    const isValid = await PasswordHasher.verify(input.password, user.passwordHash);

    if (!isValid) {
      throw new ApplicationError('E-mail ou senha invalidos.', 401, 'INVALID_CREDENTIALS');
    }

    const session = await issueAuthenticationSession(this.sessionRepository, this.refreshTokenRepository, user.id);

    return {
      ...session,
      user: sanitizeUser(user),
    };
  }
}