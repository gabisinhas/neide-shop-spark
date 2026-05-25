import { Router } from 'express';
import { ApplicationError } from '../../../../shared/application/ApplicationError';
import { asyncHandler } from '../../../../shared/infra/http/asyncHandler';
import { AuthGuards, getCurrentUserFromLocals } from '../../../../shared/infra/http/authGuards';
import { validateBody } from '../../../../shared/infra/http/requestValidation';
import { googleCredentialBodySchema, googleExchangeBodySchema, loginBodySchema, registerBodySchema } from '../../../../shared/infra/http/requestSchemas';
import { IdentityModule } from '../IdentityModule';

const GOOGLE_OAUTH_STATE_COOKIE = 'google_oauth_state';
const GOOGLE_OAUTH_CALLBACK_PATH = '/api/auth/google/callback';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const REFRESH_TOKEN_COOKIE_PATH = '/api/auth';
type CookieSameSite = 'Strict' | 'Lax' | 'None';

export function createAuthRoutes(module: IdentityModule, authGuards: AuthGuards) {
  const router = Router();

  router.post(
    '/register',
    validateBody(registerBodySchema),
    asyncHandler(async (req, res) => {
      const auth = await module.registerUser.execute(req.body);
      respondWithAuthentication(res, auth, 201);
    }),
  );

  router.post(
    '/login',
    validateBody(loginBodySchema),
    asyncHandler(async (req, res) => {
      const auth = await module.loginUser.execute(req.body);
      respondWithAuthentication(res, auth);
    }),
  );

  router.post(
    '/refresh',
    asyncHandler(async (req, res) => {
      const auth = await module.refreshSession.execute({
        refreshToken: getCookieValue(req.headers.cookie, REFRESH_TOKEN_COOKIE) ?? '',
      });

      respondWithAuthentication(res, auth);
    }),
  );

  router.post(
    '/google',
    validateBody(googleCredentialBodySchema),
    asyncHandler(async (req, res) => {
      const auth = await module.authenticateWithGoogle.execute(req.body);
      respondWithAuthentication(res, auth);
    }),
  );

  router.get(
    '/google',
    asyncHandler(async (req, res) => {
      const { state, nonce } = module.googleOAuthStateService.create(getRedirectTo(req.query.redirectTo));
      res.setHeader('Set-Cookie', createStateCookie(nonce));
      res.redirect(module.googleOAuthClient.createAuthorizationUrl(state));
    }),
  );

  router.get(
    '/google/callback',
    asyncHandler(async (req, res) => {
      if (typeof req.query.error === 'string') {
        res.setHeader('Set-Cookie', clearStateCookie());
        res.redirect(module.googleOAuthClient.buildFrontendCallbackUrl({ error: req.query.error }));
        return;
      }

      const code = getRequiredQueryParam(req.query.code, 'GOOGLE_OAUTH_CODE_MISSING');
      const state = getRequiredQueryParam(req.query.state, 'GOOGLE_OAUTH_STATE_MISSING');
      const stateNonce = getCookieValue(req.headers.cookie, GOOGLE_OAUTH_STATE_COOKIE);

      if (!stateNonce) {
        throw new ApplicationError('Cookie de state do Google ausente.', 400, 'GOOGLE_OAUTH_STATE_COOKIE_MISSING');
      }

      const { redirectTo } = module.googleOAuthStateService.verify(state, stateNonce);
      const idToken = await module.googleOAuthClient.exchangeCodeForIdToken(code);
      const auth = await module.authenticateWithGoogle.execute({ credential: idToken });
      const oauthResult = await module.createOAuthLoginResult.execute(auth);

      res.setHeader('Set-Cookie', [clearStateCookie(), createRefreshTokenCookie(auth.refreshToken)]);
      res.redirect(
        module.googleOAuthClient.buildFrontendCallbackUrl({
          token: oauthResult.token,
          redirectTo,
        }),
      );
    }),
  );

  router.post(
    '/google/exchange',
    validateBody(googleExchangeBodySchema),
    asyncHandler(async (req, res) => {
      const auth = await module.consumeOAuthLoginResult.execute(req.body);
      res.json(auth);
    }),
  );

  router.get(
    '/me',
    authGuards.requireAuth,
    asyncHandler(async (_req, res) => {
      res.json({ user: getCurrentUserFromLocals(res) });
    }),
  );

  router.post(
    '/logout',
    asyncHandler(async (req, res) => {
      await module.logoutSession.execute(getBearerToken(req), getCookieValue(req.headers.cookie, REFRESH_TOKEN_COOKIE));
      res.setHeader('Set-Cookie', createExpiredRefreshTokenCookie());
      res.status(204).send();
    }),
  );

  return router;
}

function respondWithAuthentication(
  res: { setHeader(name: string, value: string): void; status(code: number): { json(value: unknown): void } },
  auth: { accessToken: string; refreshToken: string; user: unknown },
  statusCode = 200,
) {
  res.setHeader('Set-Cookie', createRefreshTokenCookie(auth.refreshToken));
  res.status(statusCode).json({
    accessToken: auth.accessToken,
    user: auth.user,
  });
}

function getRedirectTo(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function getRequiredQueryParam(value: unknown, code: string) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  throw new ApplicationError('Parametro OAuth do Google ausente.', 400, code);
}

function getBearerToken(req: { header(name: string): string | undefined }) {
  const authorization = req.header('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  return authorization.slice('Bearer '.length).trim();
}

function getCookieValue(cookieHeader: string | undefined, name: string) {
  if (!cookieHeader) {
    return null;
  }

  for (const entry of cookieHeader.split(';')) {
    const [rawName, ...rawValue] = entry.trim().split('=');

    if (rawName === name) {
      return decodeURIComponent(rawValue.join('='));
    }
  }

  return null;
}

function createStateCookie(value: string) {
  const cookieSettings = getCookieSettings();
  const parts = [
    `${GOOGLE_OAUTH_STATE_COOKIE}=${encodeURIComponent(value)}`,
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=600',
    `Path=${GOOGLE_OAUTH_CALLBACK_PATH}`,
  ];

  if (cookieSettings.domain) {
    parts.push(`Domain=${cookieSettings.domain}`);
  }

  if (cookieSettings.secure) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

function clearStateCookie() {
  const cookieSettings = getCookieSettings();
  const parts = [
    `${GOOGLE_OAUTH_STATE_COOKIE}=`,
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    `Path=${GOOGLE_OAUTH_CALLBACK_PATH}`,
  ];

  if (cookieSettings.domain) {
    parts.push(`Domain=${cookieSettings.domain}`);
  }

  if (cookieSettings.secure) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

function createRefreshTokenCookie(value: string) {
  const cookieSettings = getCookieSettings();
  const parts = [
    `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(value)}`,
    'HttpOnly',
    `SameSite=${cookieSettings.sameSite}`,
    `Max-Age=${cookieSettings.refreshTokenMaxAgeSeconds}`,
    `Path=${REFRESH_TOKEN_COOKIE_PATH}`,
  ];

  if (cookieSettings.domain) {
    parts.push(`Domain=${cookieSettings.domain}`);
  }

  if (cookieSettings.secure) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

function createExpiredRefreshTokenCookie() {
  const cookieSettings = getCookieSettings();
  const parts = [
    `${REFRESH_TOKEN_COOKIE}=`,
    'HttpOnly',
    `SameSite=${cookieSettings.sameSite}`,
    'Max-Age=0',
    `Path=${REFRESH_TOKEN_COOKIE_PATH}`,
  ];

  if (cookieSettings.domain) {
    parts.push(`Domain=${cookieSettings.domain}`);
  }

  if (cookieSettings.secure) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

function getCookieSettings() {
  const sameSite = resolveRefreshCookieSameSite();
  const secure = resolveCookieSecure();
  const domain = process.env.AUTH_COOKIE_DOMAIN?.trim();
  const refreshTokenMaxAgeSeconds = resolveRefreshTokenMaxAgeSeconds();

  if (sameSite === 'None' && !secure) {
    throw new ApplicationError(
      'AUTH_COOKIE_SAME_SITE=None exige cookies Secure.',
      500,
      'AUTH_COOKIE_CONFIGURATION_INVALID',
    );
  }

  return {
    sameSite,
    secure,
    domain,
    refreshTokenMaxAgeSeconds,
  };
}

function resolveRefreshCookieSameSite(): CookieSameSite {
  const rawValue = process.env.AUTH_COOKIE_SAME_SITE?.trim().toLowerCase();

  switch (rawValue) {
    case undefined:
    case '':
      return 'Lax';
    case 'strict':
      return 'Strict';
    case 'lax':
      return 'Lax';
    case 'none':
      return 'None';
    default:
      throw new ApplicationError(
        'AUTH_COOKIE_SAME_SITE deve ser Strict, Lax ou None.',
        500,
        'AUTH_COOKIE_CONFIGURATION_INVALID',
      );
  }
}

function resolveCookieSecure() {
  const configuredValue = process.env.AUTH_COOKIE_SECURE?.trim().toLowerCase();

  if (!configuredValue) {
    return process.env.NODE_ENV === 'production' || process.env.APP_BASE_URL?.startsWith('https://') === true;
  }

  return configuredValue === 'true' || configuredValue === '1';
}

function resolveRefreshTokenMaxAgeSeconds() {
  const configuredValue = process.env.AUTH_REFRESH_TOKEN_MAX_AGE_SECONDS?.trim();

  if (!configuredValue) {
    return 60 * 60 * 24 * 7;
  }

  const parsedValue = Number(configuredValue);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new ApplicationError(
      'AUTH_REFRESH_TOKEN_MAX_AGE_SECONDS deve ser um inteiro positivo.',
      500,
      'AUTH_COOKIE_CONFIGURATION_INVALID',
    );
  }

  return parsedValue;
}
