import { Pool } from 'pg';
import { PasswordResetToken, PasswordResetTokenRepository } from '../../domain/repositories/PasswordResetTokenRepository';

type PasswordResetTokenRow = {
  user_id: string;
};

export class PostgresPasswordResetTokenRepository implements PasswordResetTokenRepository {
  constructor(private readonly pool: Pool) {}

  async create(token: PasswordResetToken) {
    await this.pool.query('DELETE FROM password_reset_tokens WHERE expires_at <= NOW()');
    await this.pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [token.userId]);
    await this.pool.query('INSERT INTO password_reset_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)', [token.token, token.userId, token.expiresAt]);
  }

  async consume(token: string) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM password_reset_tokens WHERE expires_at <= NOW()');

      const result = await client.query<PasswordResetTokenRow>(
        'SELECT user_id FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW() LIMIT 1',
        [token],
      );

      if (!result.rowCount) {
        await client.query('ROLLBACK');
        return null;
      }

      await client.query('DELETE FROM password_reset_tokens WHERE token = $1', [token]);
      await client.query('COMMIT');

      return result.rows[0].user_id;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteByUserId(userId: string) {
    await this.pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [userId]);
  }
}