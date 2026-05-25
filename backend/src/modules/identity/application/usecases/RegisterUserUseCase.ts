import { randomUUID } from 'node:crypto';
import { ApplicationError } from '../../../../shared/application/ApplicationError';
import { PasswordHasher } from '../../../../shared/security/PasswordHasher';
import { issueAuthenticationSession } from '../services/issueAuthenticationSession';
import { Address, PublicUser, User, UserRole } from '../../domain/entities/User';
import { RefreshTokenRepository } from '../../domain/repositories/RefreshTokenRepository';
import { SessionRepository } from '../../domain/repositories/SessionRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  address?: Address;
}

export interface AuthenticationResult {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(input: RegisterUserInput): Promise<AuthenticationResult> {
    const email = input.email.trim().toLowerCase();
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new ApplicationError('Ja existe uma conta cadastrada com este e-mail.', 409, 'EMAIL_ALREADY_REGISTERED');
    }

    const role: UserRole = 'customer';
    const passwordHash = await PasswordHasher.hash(input.password);
    const user: User = {
      id: randomUUID(),
      name: input.name.trim(),
      email,
      role,
      provider: 'email',
      passwordHash,
      address: input.address,
      createdAt: new Date().toISOString(),
    };

    const createdUser = await this.userRepository.create(user);
    const session = await issueAuthenticationSession(this.sessionRepository, this.refreshTokenRepository, createdUser.id);

    return {
      ...session,
      user: sanitizeUser(createdUser),
    };
  }
}

export function sanitizeUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}
