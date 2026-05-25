import { Pool } from 'pg';
import { CreateAuditLogUseCase } from '../application/usecases/CreateAuditLogUseCase';
import { ListRecentAuditLogsUseCase } from '../application/usecases/ListRecentAuditLogsUseCase';
import { PostgresAuditLogRepository } from './persistence/PostgresAuditLogRepository';

export class AuditModule {
  readonly auditLogRepository: PostgresAuditLogRepository;
  readonly createAuditLog: CreateAuditLogUseCase;
  readonly listRecentAuditLogs: ListRecentAuditLogsUseCase;

  constructor(pool: Pool) {
    this.auditLogRepository = new PostgresAuditLogRepository(pool);
    this.createAuditLog = new CreateAuditLogUseCase(this.auditLogRepository);
    this.listRecentAuditLogs = new ListRecentAuditLogsUseCase(this.auditLogRepository);
  }
}
