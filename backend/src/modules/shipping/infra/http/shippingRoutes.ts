import { Router } from 'express';
import { asyncHandler } from '../../../../shared/infra/http/asyncHandler';
import { ShippingModule } from '../ShippingModule';

export function createShippingRoutes(module: ShippingModule) {
  const router = Router();

  router.post(
    '/calculate',
    asyncHandler(async (req, res) => {
      const options = module.calculateShipping.execute(req.body);
      res.json(options);
    }),
  );

  return router;
}
