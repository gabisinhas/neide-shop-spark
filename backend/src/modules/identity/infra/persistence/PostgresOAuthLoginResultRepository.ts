import { Pool } from 'pg';
import { OAuthLoginResult, OAuthLoginResultPayload, OAuthLoginResultRepository } from '../../domain/repositories/OAuthLoginResultRepository';

type OAuthLoginResultRow = {
  payload: OAuthLoginResultPayload;
};

export class PostgresOAuthLoginResultRepository implements OAuthLoginResultRepository {
  constructor(private readonly pool: Pool) {}

  async create(result: OAuthLoginResult) {
    await this.pool.query('DELETE FROM oauth_login_results WHERE expires_at <= NOW()');
    await this.pool.query(
      'INSERT INTO oauth_login_results (token, payload, expires_at) VALUES ($1, $2::jsonb, $3)',
      [result.token, JSON.stringify(result.payload), result.expiresAt],
    );
  }

  async consume(token: string) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM oauth_login_results WHERE expires_at <= NOW()');

      const result = await client.query<OAuthLoginResultRow>(
        'SELECT payload FROM oauth_login_results WHERE token = $1 AND expires_at > NOW() LIMIT 1',
        [token],
      );

      if (!result.rowCount) {
        await client.query('ROLLBACK');
        return null;
      }

      await client.query('DELETE FROM oauth_login_results WHERE token = $1', [token]);
      await client.query('COMMIT');

      return result.rows[0].payload;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}