import express, { Router } from 'express';
import { asyncHandler } from '../../../../shared/infra/http/asyncHandler';
import { AuthGuards } from '../../../../shared/infra/http/authGuards';
import { UploadsModule } from '../UploadsModule';

export function createUploadRoutes(module: UploadsModule, authGuards: AuthGuards) {
  const router = Router();

  router.post(
    '/sign',
    authGuards.requireAuth,
    authGuards.requireAdmin,
    asyncHandler(async (req, res) => {
      const signedUpload = await module.createSignedUpload.execute(req.body);
      res.status(201).json(signedUpload);
    }),
  );

  router.put(
    '/local',
    express.raw({ type: '*/*', limit: '10mb' }),
    asyncHandler(async (req, res) => {
      const key = typeof req.query.key === 'string' ? req.query.key : '';
      const contentType = typeof req.query.contentType === 'string' ? req.query.contentType : '';
      const expiresAt = typeof req.query.expiresAt === 'string' ? req.query.expiresAt : '';
      const signature = typeof req.query.signature === 'string' ? req.query.signature : '';

      await module.localStorage.writeSignedUpload({
        key,
        contentType,
        expiresAt,
        signature,
        body: Buffer.isBuffer(req.body) ? req.body : Buffer.from([]),
      });

      res.status(204).send();
    }),
  );

  return router;
}
