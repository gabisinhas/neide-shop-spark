import { Router } from 'express';
import { asyncHandler } from '../../../../shared/infra/http/asyncHandler';
import { AuthGuards, getCurrentUserFromLocals } from '../../../../shared/infra/http/authGuards';
import { validateBody, validateParams } from '../../../../shared/infra/http/requestValidation';
import { idParamsSchema, updateUserProfileBodySchema, updateUserRoleBodySchema } from '../../../../shared/infra/http/requestSchemas';
import { IdentityModule } from '../IdentityModule';

type UserParams = { id: string };

export function createUserRoutes(module: IdentityModule, authGuards: AuthGuards) {
  const router = Router();

  router.get(
    '/',
    authGuards.requireAuth,
    authGuards.requireSuperAdmin,
    asyncHandler(async (_req, res) => {
      const users = await module.listUsers.execute();
      res.json(users);
    }),
  );

  router.get(
    '/:id',
    authGuards.requireAuth,
    authGuards.requireSelfOrAdmin('id'),
    validateParams(idParamsSchema),
    asyncHandler(async (req, res) => {
      const { id } = req.params as UserParams;
      const user = await module.getUserById.execute(id);
      res.json(user);
    }),
  );

  router.put(
    '/:id',
    authGuards.requireAuth,
    authGuards.requireSelfOrAdmin('id'),
    validateParams(idParamsSchema),
    validateBody(updateUserProfileBodySchema),
    asyncHandler(async (req, res) => {
      const { id } = req.params as UserParams;
      const user = await module.updateUserProfile.execute(id, req.body);
      res.json(user);
    }),
  );

  router.patch(
    '/:id/role',
    authGuards.requireAuth,
    authGuards.requireSuperAdmin,
    validateParams(idParamsSchema),
    validateBody(updateUserRoleBodySchema),
    asyncHandler(async (req, res) => {
      const { id } = req.params as UserParams;
      const actor = getCurrentUserFromLocals(res);
      const user = await module.updateUserRole.execute({
        actor,
        targetUserId: id,
        role: req.body.role,
        traceId: String(res.locals.traceId || req.header('x-request-id') || 'untracked'),
      });
      res.json(user);
    }),
  );

  router.delete(
    '/:id',
    authGuards.requireAuth,
    authGuards.requireSuperAdmin,
    validateParams(idParamsSchema),
    asyncHandler(async (req, res) => {
      const { id } = req.params as UserParams;
      const actor = getCurrentUserFromLocals(res);
      await module.deactivateUser.execute({
        actor,
        targetUserId: id,
        traceId: String(res.locals.traceId || req.header('x-request-id') || 'untracked'),
      });
      res.status(204).send();
    }),
  );

  return router;
}
