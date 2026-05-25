import express from 'express';
import { logger } from '../observability/logger';

const SENSITIVE_ROUTE_PATTERNS = ['/api/auth/', '/api/payments/', '/api/orders', '/api/users/', '/api/audit-logs'];

function shouldLogRequest(route: string) {
  return SENSITIVE_ROUTE_PATTERNS.some((pattern) => route.startsWith(pattern));
}

export function requestLoggingMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const startedAt = Date.now();
  const traceId = String(res.locals.traceId || req.header('x-request-id') || 'untracked');

  res.on('finish', () => {
    const route = req.originalUrl;

    if (!shouldLogRequest(route)) {
      return;
    }

    const currentUser = res.locals.currentUser as { id?: string } | undefined;

    logger.info({
      message: 'HTTP request completed',
      request_id: traceId,
      user_id: currentUser?.id,
      route,
      method: req.method,
      status_code: res.statusCode,
      duration_ms: Date.now() - startedAt,
    });
  });

  next();
}
