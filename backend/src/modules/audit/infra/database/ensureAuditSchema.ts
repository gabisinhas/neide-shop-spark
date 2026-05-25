import { getPool } from '../../../../../server/db';

export async function ensureAuditSchema() {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      actor_user_email TEXT NOT NULL,
      target_entity TEXT NOT NULL,
      target_entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      metadata JSONB,
      trace_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}
