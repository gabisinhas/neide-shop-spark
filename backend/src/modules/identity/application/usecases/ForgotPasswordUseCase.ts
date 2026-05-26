import { PasswordResetTokenRepository } from '../../domain/repositories/PasswordResetTokenRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { SessionTokenService } from '../../../../shared/security/SessionTokenService';

export interface ForgotPasswordInput {
  email: string;
}

export interface ForgotPasswordResult {
  message: string;
  resetToken?: string;
  expiresAt?: string;
}

const GENERIC_MESSAGE = 'Se existir uma conta elegivel para este e-mail, as instrucoes de redefinicao foram geradas.';

export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
  ) {}

  async execute(input: ForgotPasswordInput): Promise<ForgotPasswordResult> {
    const email = input.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(email);

    if (!user || user.deletedAt || user.provider !== 'email' || !user.passwordHash) {
      return { message: GENERIC_MESSAGE };
    }

    const expiresAt = new Date(Date.now() + getPasswordResetTokenTtlSeconds() * 1000).toISOString();
    const resetToken = SessionTokenService.generate();

    await this.passwordResetTokenRepository.create({
      token: resetToken,
      userId: user.id,
      expiresAt,
    });

    if (shouldExposeResetToken()) {
      return {
        message: GENERIC_MESSAGE,
        resetToken,
        expiresAt,
      };
    }

    return { message: GENERIC_MESSAGE };
  }
}

function getPasswordResetTokenTtlSeconds() {
  const configuredValue = Number(process.env.AUTH_PASSWORD_RESET_TOKEN_TTL_SECONDS?.trim());

  if (Number.isInteger(configuredValue) && configuredValue > 0) {
    return configuredValue;
  }

  return 60 * 60;
}

function shouldExposeResetToken() {
  const explicitValue = process.env.AUTH_EXPOSE_PASSWORD_RESET_TOKEN?.trim().toLowerCase();

  if (explicitValue === 'true' || explicitValue === '1') {
    return true;
  }

  if (explicitValue === 'false' || explicitValue === '0') {
    return false;
  }

  return process.env.NODE_ENV !== 'production';
}