import { Router } from 'express';
import { asyncHandler } from '../../../../shared/infra/http/asyncHandler';
import { AuthGuards } from '../../../../shared/infra/http/authGuards';
import { validateBody, validateParams } from '../../../../shared/infra/http/requestValidation';
import { createProductBodySchema, idParamsSchema, updateProductBodySchema } from '../../../../shared/infra/http/requestSchemas';
import { CatalogModule } from '../CatalogModule';
import { presentProduct } from './productPresenter';

type ProductParams = { id: string };

export function createProductRoutes(module: CatalogModule, authGuards: AuthGuards) {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const products = await module.listProducts.execute();
      res.json(products.map((product) => presentProduct(product, req.get('host') || '', req.protocol)));
    }),
  );

  router.get(
    '/:id',
    validateParams(idParamsSchema),
    asyncHandler(async (req, res) => {
      const { id } = req.params as ProductParams;
      const product = await module.getProductById.execute(id);
      res.json(presentProduct(product, req.get('host') || '', req.protocol));
    }),
  );

  router.post(
    '/',
    authGuards.requireAuth,
    authGuards.requireAdmin,
    validateBody(createProductBodySchema),
    asyncHandler(async (req, res) => {
      const product = await module.createProduct.execute(req.body);
      res.status(201).json(presentProduct(product, req.get('host') || '', req.protocol));
    }),
  );

  router.put(
    '/:id',
    authGuards.requireAuth,
    authGuards.requireAdmin,
    validateParams(idParamsSchema),
    validateBody(updateProductBodySchema),
    asyncHandler(async (req, res) => {
      const { id } = req.params as ProductParams;
      const product = await module.updateProduct.execute(id, req.body);
      res.json(presentProduct(product, req.get('host') || '', req.protocol));
    }),
  );

  router.delete(
    '/:id',
    authGuards.requireAuth,
    authGuards.requireAdmin,
    validateParams(idParamsSchema),
    asyncHandler(async (req, res) => {
      const { id } = req.params as ProductParams;
      await module.deleteProduct.execute(id);
      res.status(204).send();
    }),
  );

  return router;
}
