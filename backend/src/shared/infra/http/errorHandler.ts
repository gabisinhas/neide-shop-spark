import express from 'express';
import { ApplicationError } from '../../application/ApplicationError';
import { DomainError } from '../../domain/DomainError';
import { logger } from '../observability/logger';

export function errorHandler(error: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) {
  const traceId = String(res.locals.traceId || req.header('x-request-id') || 'untracked');
  const currentUser = res.locals.currentUser as { id?: string } | undefined;
  const route = req.originalUrl;

  if (error instanceof ApplicationError) {
    logger.error({
      code: error.code,
      message: error.message,
      request_id: traceId,
      user_id: currentUser?.id,
      route,
      method: req.method,
      status_code: error.statusCode,
      details: error.details,
    });

    res.status(error.statusCode).json({
      message: error.message,
      code: error.code,
      traceId,
    });
    return;
  }

  if (error instanceof DomainError) {
    logger.warn({
      message: error.message,
      request_id: traceId,
      user_id: currentUser?.id,
      route,
      method: req.method,
      status_code: 400,
      code: 'DOMAIN_ERROR',
    });

    res.status(400).json({ message: error.message, code: 'DOMAIN_ERROR', traceId });
    return;
  }

  logger.error({
    message: 'Unexpected error while processing request.',
    request_id: traceId,
    user_id: currentUser?.id,
    route,
    method: req.method,
    status_code: 500,
    code: 'UNEXPECTED_ERROR',
    error,
  });
  res.status(500).json({
    message: 'Erro interno ao processar a requisição.',
    code: 'UNEXPECTED_ERROR',
    traceId,
  });
}
