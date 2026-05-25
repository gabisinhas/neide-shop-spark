import { Pool } from 'pg';
import { AuditLog } from '../../domain/entities/AuditLog';
import { AuditLogRepository } from '../../domain/repositories/AuditLogRepository';

type AuditLogRow = {
  id: string;
  actor_user_id: string;
  actor_user_email: string;
  target_entity: string;
  target_entity_id: string;
  action: string;
  metadata: Record<string, unknown> | null;
  trace_id: string;
  created_at: Date | string;
};

export class PostgresAuditLogRepository implements AuditLogRepository {
  constructor(private readonly pool: Pool) {}

  async create(log: AuditLog) {
    await this.pool.query(
      `
        INSERT INTO audit_logs (
          id,
          actor_user_id,
          actor_user_email,
          target_entity,
          target_entity_id,
          action,
          metadata,
          trace_id,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9)
      `,
      [
        log.id,
        log.actorUserId,
        log.actorUserEmail,
        log.targetEntity,
        log.targetEntityId,
        log.action,
        JSON.stringify(log.metadata ?? null),
        log.traceId,
        log.createdAt,
      ],
    );

    return log;
  }

  async listRecent(limit = 30) {
    const result = await this.pool.query<AuditLogRow>(
      `
        SELECT *
        FROM audit_logs
        ORDER BY created_at DESC
        LIMIT $1
      `,
      [limit],
    );

    return result.rows.map((row) => ({
      id: row.id,
      actorUserId: row.actor_user_id,
      actorUserEmail: row.actor_user_email,
      targetEntity: row.target_entity,
      targetEntityId: row.target_entity_id,
      action: row.action,
      metadata: row.metadata ?? undefined,
      traceId: row.trace_id,
      createdAt: new Date(row.created_at).toISOString(),
    }));
  }
}
