import { randomUUID } from 'node:crypto';
import express from 'express';

export function requestContextMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const traceId = req.header('x-request-id') || randomUUID();
  res.locals.traceId = traceId;
  res.setHeader('x-request-id', traceId);
  next();
}
