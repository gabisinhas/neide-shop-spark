import { Pool } from 'pg';
import { Session, SessionRepository } from '../../domain/repositories/SessionRepository';

type SessionRow = {
  token: string;
  user_id: string;
};

export class PostgresSessionRepository implements SessionRepository {
  constructor(private readonly pool: Pool) {}

  async create(session: Session) {
    await this.pool.query('INSERT INTO sessions (token, user_id) VALUES ($1, $2)', [session.token, session.userId]);
  }

  async findUserIdByToken(token: string) {
    const result = await this.pool.query<SessionRow>('SELECT * FROM sessions WHERE token = $1 LIMIT 1', [token]);
    return result.rows[0]?.user_id ?? null;
  }

  async delete(token: string) {
    await this.pool.query('DELETE FROM sessions WHERE token = $1', [token]);
  }
}