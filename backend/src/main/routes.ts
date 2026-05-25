import { Router } from 'express';
import { AppDependencies } from './dependencies';
import { asyncHandler } from '../shared/infra/http/asyncHandler';
import { createAuthGuards } from '../shared/infra/http/authGuards';
import { createMercadoPagoRoutes } from '../modules/billing/infra/http/mercadoPagoRoutes';
import { createProductRoutes } from '../modules/catalog/infra/http/productRoutes';
import { createAuthRoutes } from '../modules/identity/infra/http/authRoutes';
import { createUserRoutes } from '../modules/identity/infra/http/userRoutes';
import { createOrderRoutes } from '../modules/sales/infra/http/orderRoutes';
import { createShippingRoutes } from '../modules/shipping/infra/http/shippingRoutes';
import { createUploadRoutes } from '../modules/uploads/infra/http/uploadRoutes';
import { createAuditRoutes } from '../modules/audit/infra/http/auditRoutes';

export function createRoutes(dependencies: AppDependencies) {
  const router = Router();
  const authGuards = createAuthGuards(dependencies.identity);

  router.get(
    '/health',
    asyncHandler(async (_req, res) => {
      const result = await dependencies.pool.query('SELECT 1');
      res.json({ ok: true, db: result.rowCount === 1 });
    }),
  );

  router.use('/products', createProductRoutes(dependencies.catalog, authGuards));

  router.use('/auth', createAuthRoutes(dependencies.identity, authGuards));
  router.use('/users', createUserRoutes(dependencies.identity, authGuards));
  router.use('/audit-logs', createAuditRoutes(dependencies.audit, authGuards));
  router.use('/orders', createOrderRoutes(dependencies.sales, authGuards));
  router.use('/shipping', createShippingRoutes(dependencies.shipping));
  router.use('/uploads', createUploadRoutes(dependencies.uploads, authGuards));
  router.use('/payments/mercado-pago', createMercadoPagoRoutes(dependencies.billing, authGuards));

  return router;
}
