import { Router } from 'express';
import { asyncHandler } from '../../../../shared/infra/http/asyncHandler';
import { CatalogModule } from '../CatalogModule';
import { UploadsModule } from '../../../uploads/infra/UploadsModule';

export function createProductImageRoutes(catalogModule: CatalogModule, uploadsModule: UploadsModule) {
  const router = Router();

  // Gera uma presigned URL para a imagem do produto
  router.get(
    '/:id/image-url',
    asyncHandler(async (req, res) => {
      const product = await catalogModule.getProductById.execute(req.params.id);
      if (!product || !product.imageStorageKey) {
        res.status(404).json({ error: 'Imagem não encontrada para este produto.' });
        return;
      }
      // Gera a presigned URL usando o serviço de storage
      const signed = await uploadsModule.storage.createSignedDownloadUrl({
        key: product.imageStorageKey,
        contentType: product.imageContentType || 'image/jpeg',
        expiresInSeconds: 300,
      });
      res.json({ url: signed.url, expiresAt: signed.expiresAt });
    })
  );

  return router;
}
