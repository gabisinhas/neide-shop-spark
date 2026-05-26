import { ApplicationError } from '../../../../shared/application/ApplicationError';
import { PasswordHasher } from '../../../../shared/security/PasswordHasher';
import { PasswordResetTokenRepository } from '../../domain/repositories/PasswordResetTokenRepository';
import { RefreshTokenRepository } from '../../domain/repositories/RefreshTokenRepository';
import { SessionRepository } from '../../domain/repositories/SessionRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { assertActiveUser } from '../services/assertActiveUser';

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(input: ResetPasswordInput) {
    const token = input.token.trim();

    if (!token) {
      throw new ApplicationError('Token de redefinicao ausente.', 400, 'PASSWORD_RESET_TOKEN_MISSING');
    }

    const userId = await this.passwordResetTokenRepository.consume(token);

    if (!userId) {
      throw new ApplicationError('Token de redefinicao invalido ou expirado.', 401, 'PASSWORD_RESET_TOKEN_INVALID');
    }

    const user = await this.userRepository.findById(userId);
    assertActiveUser(user, 'USER_NOT_FOUND');

    if (user.provider !== 'email') {
      throw new ApplicationError('Redefinicao de senha indisponivel para esta conta.', 400, 'PASSWORD_RESET_NOT_SUPPORTED');
    }

    user.passwordHash = await PasswordHasher.hash(input.password);
    await this.userRepository.update(user);
    await this.sessionRepository.deleteByUserId(user.id);
    await this.refreshTokenRepository.deleteByUserId(user.id);
    await this.passwordResetTokenRepository.deleteByUserId(user.id);
  }
}