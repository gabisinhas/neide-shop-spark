import { PasswordHasher } from '../../../../shared/security/PasswordHasher';
import { getPool } from '../../../../../server/db';

export async function ensureIdentitySchema() {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      provider TEXT NOT NULL,
      password_hash TEXT,
      address JSONB,
      deleted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ');
  await pool.query('CREATE INDEX IF NOT EXISTS users_deleted_at_idx ON users(deleted_at)');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS oauth_login_results (
      token TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const adminEmail = 'superadmin@nscloset.com';
  const adminExists = await pool.query<{ id: string }>('SELECT id FROM users WHERE email = $1 LIMIT 1', [adminEmail]);

  if (adminExists.rowCount) {
    return;
  }

  const adminPasswordHash = await PasswordHasher.hash('admin123');
  await pool.query(
    `
      INSERT INTO users (id, name, email, role, provider, password_hash, created_at, updated_at)
      VALUES ('super-admin-seed', 'Equipe NS Closet', $1, 'super_admin', 'email', $2, NOW(), NOW())
    `,
    [adminEmail, adminPasswordHash],
  );
}
