import { AuditLogRepository } from '../../domain/repositories/AuditLogRepository';

export class ListRecentAuditLogsUseCase {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async execute(limit = 30) {
    return this.auditLogRepository.listRecent(limit);
  }
}
