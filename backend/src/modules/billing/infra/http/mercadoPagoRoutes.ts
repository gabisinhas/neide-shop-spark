import { Router } from 'express';
import { asyncHandler } from '../../../../shared/infra/http/asyncHandler';
import { AuthGuards } from '../../../../shared/infra/http/authGuards';
import { validateBody } from '../../../../shared/infra/http/requestValidation';
import { mercadoPagoCheckoutBodySchema } from '../../../../shared/infra/http/requestSchemas';
import { BillingModule } from '../BillingModule';

export function createMercadoPagoRoutes(module: BillingModule, authGuards: AuthGuards) {
  const router = Router();

  router.post(
    '/checkout',
    authGuards.requireAuth,
    validateBody(mercadoPagoCheckoutBodySchema),
    asyncHandler(async (req, res) => {
      const checkout = await module.createMercadoPagoCheckout.execute(req.body.orderId);
      res.status(201).json(checkout);
    }),
  );

  router.post(
    '/webhook',
    asyncHandler(async (req, res) => {
      const paymentId = extractMercadoPagoPaymentId(req.body, req.query);
      const result = await module.handleMercadoPagoWebhook.execute({ paymentId });
      res.status(200).json(result);
    }),
  );

  return router;
}

function extractMercadoPagoPaymentId(body: unknown, query: Record<string, unknown>) {
  const bodyRecord = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const data = typeof bodyRecord.data === 'object' && bodyRecord.data !== null ? (bodyRecord.data as Record<string, unknown>) : {};

  if (typeof data.id === 'string') {
    return data.id;
  }

  if (typeof query['data.id'] === 'string') {
    return query['data.id'] as string;
  }

  if (typeof query.id === 'string') {
    return query.id as string;
  }

  return undefined;
}