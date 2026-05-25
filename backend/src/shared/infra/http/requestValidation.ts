import type express from 'express';
import { ZodType } from 'zod';
import { ApplicationError } from '../../application/ApplicationError';

function buildValidationMiddleware<T>(schema: ZodType<T>, source: 'body' | 'params' | 'query'): express.RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      next(
        new ApplicationError('Dados de requisicao invalidos.', 400, 'REQUEST_VALIDATION_ERROR', {
          source,
          issues: result.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        }),
      );
      return;
    }

    req[source] = result.data as never;
    next();
  };
}

export function validateBody<T>(schema: ZodType<T>) {
  return buildValidationMiddleware(schema, 'body');
}

export function validateParams<T>(schema: ZodType<T>) {
  return buildValidationMiddleware(schema, 'params');
}

export function validateQuery<T>(schema: ZodType<T>) {
  return buildValidationMiddleware(schema, 'query');
}