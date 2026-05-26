export interface RefreshToken {
  token: string;
  userId: string;
  expiresAt: string;
}

export interface RefreshTokenRepository {
  create(token: RefreshToken): Promise<void>;
  findUserIdByToken(token: string): Promise<string | null>;
  delete(token: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}