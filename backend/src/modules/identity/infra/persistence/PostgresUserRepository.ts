import { Pool } from 'pg';
import { Address, User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: User['role'];
  provider: User['provider'];
  password_hash: string | null;
  address: Address | null;
  created_at: Date | string;
  deleted_at: Date | string | null;
};

export class PostgresUserRepository implements UserRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: string) {
    const result = await this.pool.query<UserRow>('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
    return result.rows[0] ? this.toUser(result.rows[0]) : null;
  }

  async findByEmail(email: string) {
    const result = await this.pool.query<UserRow>('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
    return result.rows[0] ? this.toUser(result.rows[0]) : null;
  }

  async list() {
    const result = await this.pool.query<UserRow>('SELECT * FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC, email ASC');
    return result.rows.map((row) => this.toUser(row));
  }

  async create(user: User) {
    await this.pool.query(
      `
        INSERT INTO users (
          id,
          name,
          email,
          role,
          provider,
          password_hash,
          address,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, NOW())
      `,
      [user.id, user.name, user.email, user.role, user.provider, user.passwordHash ?? null, JSON.stringify(user.address ?? null), user.createdAt],
    );

    return (await this.findById(user.id)) as User;
  }

  async update(user: User) {
    await this.pool.query(
      `
        UPDATE users
        SET
          name = $2,
          email = $3,
          role = $4,
          provider = $5,
          password_hash = $6,
          address = $7::jsonb,
          updated_at = NOW()
        WHERE id = $1
      `,
      [user.id, user.name, user.email, user.role, user.provider, user.passwordHash ?? null, JSON.stringify(user.address ?? null)],
    );

    return (await this.findById(user.id)) as User;
  }

  async deactivate(id: string, deletedAt: string) {
    await this.pool.query(
      `
        UPDATE users
        SET deleted_at = $2, updated_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL
      `,
      [id, deletedAt],
    );
  }

  private toUser(row: UserRow): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      provider: row.provider,
      passwordHash: row.password_hash ?? undefined,
      address: row.address ?? undefined,
      createdAt: new Date(row.created_at).toISOString(),
      deletedAt: row.deleted_at ? new Date(row.deleted_at).toISOString() : undefined,
    };
  }
}
