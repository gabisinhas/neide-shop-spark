export interface AuditLog {
  id: string;
  actorUserId: string;
  actorUserEmail: string;
  targetEntity: string;
  targetEntityId: string;
  action: string;
  metadata?: Record<string, unknown>;
  traceId: string;
  createdAt: string;
}
