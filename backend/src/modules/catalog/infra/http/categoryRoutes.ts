import { Router } from 'express';
import { asyncHandler } from '../../../../shared/infra/http/asyncHandler';
import { AuthGuards } from '../../../../shared/infra/http/authGuards';
import { createCategoryBodySchema, idParamsSchema, updateCategoryBodySchema } from '../../../../shared/infra/http/requestSchemas';
import { validateBody, validateParams } from '../../../../shared/infra/http/requestValidation';
import { CatalogModule } from '../CatalogModule';

type CategoryParams = { id: string };

export function createCategoryRoutes(module: CatalogModule, authGuards: AuthGuards) {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (_req, res) => {
      const categories = await module.listCategories.execute();
      res.json(categories);
    }),
  );

  router.get(
    '/:id',
    validateParams(idParamsSchema),
    asyncHandler(async (req, res) => {
      const { id } = req.params as CategoryParams;
      const category = await module.getCategoryById.execute(id);
      res.json(category);
    }),
  );

  router.post(
    '/',
    authGuards.requireAuth,
    authGuards.requireAdmin,
    validateBody(createCategoryBodySchema),
    asyncHandler(async (req, res) => {
      const category = await module.createCategory.execute(req.body);
      res.status(201).json(category);
    }),
  );

  router.put(
    '/:id',
    authGuards.requireAuth,
    authGuards.requireAdmin,
    validateParams(idParamsSchema),
    validateBody(updateCategoryBodySchema),
    asyncHandler(async (req, res) => {
      const { id } = req.params as CategoryParams;
      const category = await module.updateCategory.execute(id, req.body);
      res.json(category);
    }),
  );

  router.delete(
    '/:id',
    authGuards.requireAuth,
    authGuards.requireAdmin,
    validateParams(idParamsSchema),
    asyncHandler(async (req, res) => {
      const { id } = req.params as CategoryParams;
      await module.deleteCategory.execute(id);
      res.status(204).send();
    }),
  );

  return router;
}