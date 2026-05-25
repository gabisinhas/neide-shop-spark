import { randomUUID } from 'node:crypto';
import { AuditLog } from '../../domain/entities/AuditLog';
import { AuditLogRepository } from '../../domain/repositories/AuditLogRepository';

export interface CreateAuditLogInput {
  actorUserId: string;
  actorUserEmail: string;
  targetEntity: string;
  targetEntityId: string;
  action: string;
  metadata?: Record<string, unknown>;
  traceId: string;
}

export class CreateAuditLogUseCase {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async execute(input: CreateAuditLogInput) {
    const log: AuditLog = {
      id: randomUUID(),
      actorUserId: input.actorUserId,
      actorUserEmail: input.actorUserEmail,
      targetEntity: input.targetEntity,
      targetEntityId: input.targetEntityId,
      action: input.action,
      metadata: input.metadata,
      traceId: input.traceId,
      createdAt: new Date().toISOString(),
    };

    return this.auditLogRepository.create(log);
  }
}
