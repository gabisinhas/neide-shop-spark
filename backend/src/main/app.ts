import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDependencies } from './dependencies';
import { createRoutes } from './routes';
import { errorHandler } from '../shared/infra/http/errorHandler';
import { applyRouteRateLimiters } from '../shared/infra/http/rateLimiters';
import { requestContextMiddleware } from '../shared/infra/http/requestContextMiddleware';
import { requestLoggingMiddleware } from '../shared/infra/http/requestLoggingMiddleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();
  const dependencies = createDependencies();
  const allowedOrigins = new Set(resolveAllowedOrigins());

  if (shouldTrustProxy()) {
    app.set('trust proxy', 1);
  }

  app.disable('x-powered-by');
  app.use(requestContextMiddleware);
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      hsts: process.env.NODE_ENV === 'production',
    }),
  );
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error('CORS origin not allowed.'));
      },
      credentials: true,
    }),
  );
  applyRouteRateLimiters(app);
  app.use(requestLoggingMiddleware);
  app.use(express.json({ limit: process.env.API_JSON_LIMIT?.trim() || '10mb' }));
  app.use('/assets', express.static(path.resolve(__dirname, '../../public/assets')));
  app.use('/api', createRoutes(dependencies));
  app.use(errorHandler);

  return app;
}

function resolveAllowedOrigins() {
  const configuredOrigins = [
    process.env.FRONTEND_APP_URL,
    ...(process.env.FRONTEND_ALLOWED_ORIGINS?.split(',') ?? []),
    'http://localhost:5173',
    'http://localhost:8080',
  ]
    .map((origin) => origin?.trim())
    .filter((origin): origin is string => Boolean(origin));

  return Array.from(new Set(configuredOrigins));
}

function shouldTrustProxy() {
  const configuredValue = process.env.TRUST_PROXY?.trim().toLowerCase();

  if (!configuredValue) {
    return process.env.NODE_ENV === 'production';
  }

  return configuredValue === 'true' || configuredValue === '1';
}
