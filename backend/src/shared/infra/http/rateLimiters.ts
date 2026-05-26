import type express from 'express';
import { rateLimit } from 'express-rate-limit';

function getWindowMs(envName: string, fallbackMinutes: number) {
  const rawValue = process.env[envName];
  const parsedValue = Number(rawValue);

  if (Number.isFinite(parsedValue) && parsedValue > 0) {
    return parsedValue * 60 * 1000;
  }

  return fallbackMinutes * 60 * 1000;
}

function getMaxRequests(envName: string, fallbackValue: number) {
  const rawValue = process.env[envName];
  const parsedValue = Number(rawValue);

  if (Number.isFinite(parsedValue) && parsedValue > 0) {
    return parsedValue;
  }

  return fallbackValue;
}

function createJsonRateLimiter(options: {
  windowEnv: string;
  maxEnv: string;
  fallbackWindowMinutes: number;
  fallbackMax: number;
  code: string;
  message: string;
}) {
  return rateLimit({
    windowMs: getWindowMs(options.windowEnv, options.fallbackWindowMinutes),
    max: getMaxRequests(options.maxEnv, options.fallbackMax),
    standardHeaders: true,
    legacyHeaders: false,
    handler(req, res) {
      const traceId = String(res.locals.traceId || req.header('x-request-id') || 'untracked');
      res.status(429).json({
        message: options.message,
        code: options.code,
        traceId,
      });
    },
  });
}

export const apiRateLimiter = createJsonRateLimiter({
  windowEnv: 'RATE_LIMIT_API_WINDOW_MINUTES',
  maxEnv: 'RATE_LIMIT_API_MAX',
  fallbackWindowMinutes: 15,
  fallbackMax: 300,
  code: 'RATE_LIMIT_API_EXCEEDED',
  message: 'Muitas requisicoes para a API. Tente novamente em alguns instantes.',
});

export const authRateLimiter = createJsonRateLimiter({
  windowEnv: 'RATE_LIMIT_AUTH_WINDOW_MINUTES',
  maxEnv: 'RATE_LIMIT_AUTH_MAX',
  fallbackWindowMinutes: 15,
  fallbackMax: 15,
  code: 'RATE_LIMIT_AUTH_EXCEEDED',
  message: 'Muitas tentativas de autenticacao. Aguarde antes de tentar novamente.',
});

export const paymentRateLimiter = createJsonRateLimiter({
  windowEnv: 'RATE_LIMIT_PAYMENT_WINDOW_MINUTES',
  maxEnv: 'RATE_LIMIT_PAYMENT_MAX',
  fallbackWindowMinutes: 10,
  fallbackMax: 20,
  code: 'RATE_LIMIT_PAYMENT_EXCEEDED',
  message: 'Muitas requisicoes de pagamento. Aguarde antes de tentar novamente.',
});

export const webhookRateLimiter = createJsonRateLimiter({
  windowEnv: 'RATE_LIMIT_WEBHOOK_WINDOW_MINUTES',
  maxEnv: 'RATE_LIMIT_WEBHOOK_MAX',
  fallbackWindowMinutes: 1,
  fallbackMax: 120,
  code: 'RATE_LIMIT_WEBHOOK_EXCEEDED',
  message: 'Muitas notificacoes recebidas em pouco tempo.',
});

export function applyRouteRateLimiters(app: express.Express) {
  app.use('/api', apiRateLimiter);
  app.use('/api/auth/login', authRateLimiter);
  app.use('/api/auth/register', authRateLimiter);
  app.use('/api/auth/refresh', authRateLimiter);
  app.use('/api/auth/forgot-password', authRateLimiter);
  app.use('/api/auth/reset-password', authRateLimiter);
  app.use('/api/auth/google', authRateLimiter);
  app.use('/api/payments/mercado-pago/checkout', paymentRateLimiter);
  app.use('/api/payments/mercado-pago/webhook', webhookRateLimiter);
}