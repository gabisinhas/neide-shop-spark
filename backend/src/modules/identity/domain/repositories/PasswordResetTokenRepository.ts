export interface PasswordResetToken {
  token: string;
  userId: string;
  expiresAt: string;
}

export interface PasswordResetTokenRepository {
  create(token: PasswordResetToken): Promise<void>;
  consume(token: string): Promise<string | null>;
  deleteByUserId(userId: string): Promise<void>;
}