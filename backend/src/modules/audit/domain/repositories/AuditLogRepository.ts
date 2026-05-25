import { AuditLog } from '../entities/AuditLog';

export interface AuditLogRepository {
  create(log: AuditLog): Promise<AuditLog>;
  listRecent(limit?: number): Promise<AuditLog[]>;
}
