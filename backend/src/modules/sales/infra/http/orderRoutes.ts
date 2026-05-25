import { Router } from 'express';
import { asyncHandler } from '../../../../shared/infra/http/asyncHandler';
import { ApplicationError } from '../../../../shared/application/ApplicationError';
import { AuthGuards, getCurrentUserFromLocals } from '../../../../shared/infra/http/authGuards';
import { validateBody, validateParams, validateQuery } from '../../../../shared/infra/http/requestValidation';
import { createOrderBodySchema, idParamsSchema, orderListQuerySchema, updateOrderStatusBodySchema } from '../../../../shared/infra/http/requestSchemas';
import { SalesModule } from '../SalesModule';
import { isAdminRole } from '../../../identity/domain/services/roleGuards';

type OrderParams = { id: string };

export function createOrderRoutes(module: SalesModule, authGuards: AuthGuards) {
  const router = Router();

  router.get(
    '/',
    authGuards.requireAuth,
    validateQuery(orderListQuerySchema),
    asyncHandler(async (req, res) => {
      const currentUser = getCurrentUserFromLocals(res);
      const requestedUserId = typeof req.query.userId === 'string' ? req.query.userId : undefined;
      const userId = isAdminRole(currentUser.role) ? requestedUserId : currentUser.id;
      const orders = await module.listOrders.execute({ userId });
      res.json(orders);
    }),
  );

  router.get(
    '/:id',
    authGuards.requireAuth,
    validateParams(idParamsSchema),
    asyncHandler(async (req, res) => {
      const { id } = req.params as OrderParams;
      const order = await module.getOrderById.execute(id);

      const currentUser = getCurrentUserFromLocals(res);
      if (!isAdminRole(currentUser.role) && order.userId !== currentUser.id) {
        throw new ApplicationError('Voce nao tem permissao para acessar este pedido.', 403, 'ORDER_FORBIDDEN');
      }

      res.json(order);
    }),
  );

  router.post(
    '/',
    authGuards.requireAuth,
    validateBody(createOrderBodySchema),
    asyncHandler(async (req, res) => {
      const currentUser = getCurrentUserFromLocals(res);
      const order = await module.createOrder.execute({
        ...req.body,
        userId: currentUser.id,
      });
      res.status(201).json(order);
    }),
  );

  router.patch(
    '/:id/status',
    authGuards.requireAuth,
    authGuards.requireAdmin,
    validateParams(idParamsSchema),
    validateBody(updateOrderStatusBodySchema),
    asyncHandler(async (req, res) => {
      const { id } = req.params as OrderParams;
      const order = await module.updateOrderStatus.execute(id, req.body.status);
      res.json(order);
    }),
  );

  return router;
}
