import { Router } from 'express';
import { asyncHandler } from '../../../../shared/infra/http/asyncHandler';
import { AuthGuards } from '../../../../shared/infra/http/authGuards';
import { AuditModule } from '../AuditModule';

export function createAuditRoutes(module: AuditModule, authGuards: AuthGuards) {
  const router = Router();

  router.get(
    '/',
    authGuards.requireAuth,
    authGuards.requireSuperAdmin,
    asyncHandler(async (req, res) => {
      const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined;
      const logs = await module.listRecentAuditLogs.execute(limit);
      res.json(logs);
    }),
  );

  return router;
}
