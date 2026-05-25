import { Pool } from 'pg';
import { RefreshToken, RefreshTokenRepository } from '../../domain/repositories/RefreshTokenRepository';

type RefreshTokenRow = {
  user_id: string;
};

export class PostgresRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly pool: Pool) {}

  async create(token: RefreshToken) {
    await this.pool.query('DELETE FROM refresh_tokens WHERE expires_at <= NOW()');
    await this.pool.query('INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)', [token.token, token.userId, token.expiresAt]);
  }

  async findUserIdByToken(token: string) {
    const result = await this.pool.query<RefreshTokenRow>(
      'SELECT user_id FROM refresh_tokens WHERE token = $1 AND expires_at > NOW() LIMIT 1',
      [token],
    );

    return result.rows[0]?.user_id ?? null;
  }

  async delete(token: string) {
    await this.pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
  }
}