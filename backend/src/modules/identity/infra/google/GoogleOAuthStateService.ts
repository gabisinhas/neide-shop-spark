import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { ApplicationError } from '../../../../shared/application/ApplicationError';

type GoogleOAuthStatePayload = {
  exp: number;
  nonce: string;
  redirectTo: string;
};

export class GoogleOAuthStateService {
  private readonly secret = resolveGoogleOAuthStateSecret();

  create(redirectTo: string) {
    if (!this.secret) {
      throw new ApplicationError('Segredo para state do Google OAuth nao configurado.', 500, 'GOOGLE_OAUTH_STATE_SECRET_MISSING');
    }

    const payload: GoogleOAuthStatePayload = {
      exp: Date.now() + 10 * 60 * 1000,
      nonce: randomBytes(24).toString('hex'),
      redirectTo: normalizeRedirectTo(redirectTo),
    };

    const encodedPayload = toBase64Url(JSON.stringify(payload));
    const signature = this.sign(encodedPayload);

    return {
      nonce: payload.nonce,
      redirectTo: payload.redirectTo,
      state: `${encodedPayload}.${signature}`,
    };
  }

  verify(state: string, expectedNonce: string) {
    if (!this.secret) {
      throw new ApplicationError('Segredo para state do Google OAuth nao configurado.', 500, 'GOOGLE_OAUTH_STATE_SECRET_MISSING');
    }

    const [encodedPayload, signature] = state.split('.');

    if (!encodedPayload || !signature) {
      throw new ApplicationError('State OAuth do Google invalido.', 400, 'GOOGLE_OAUTH_STATE_INVALID');
    }

    const expectedSignature = this.sign(encodedPayload);

    if (!safeEquals(signature, expectedSignature)) {
      throw new ApplicationError('State OAuth do Google invalido.', 400, 'GOOGLE_OAUTH_STATE_INVALID');
    }

    const payload = JSON.parse(fromBase64Url(encodedPayload)) as GoogleOAuthStatePayload;

    if (payload.exp <= Date.now()) {
      throw new ApplicationError('State OAuth do Google expirado.', 400, 'GOOGLE_OAUTH_STATE_EXPIRED');
    }

    if (!safeEquals(payload.nonce, expectedNonce)) {
      throw new ApplicationError('State OAuth do Google nao confere.', 400, 'GOOGLE_OAUTH_STATE_MISMATCH');
    }

    return {
      redirectTo: normalizeRedirectTo(payload.redirectTo),
    };
  }

  private sign(value: string) {
    return createHmac('sha256', this.secret as string).update(value).digest('base64url');
  }
}

function normalizeRedirectTo(value: string | undefined) {
  const redirectTo = value?.trim();

  if (!redirectTo || !redirectTo.startsWith('/') || redirectTo.startsWith('//')) {
    return '/minha-conta/pedidos';
  }

  return redirectTo;
}

function toBase64Url(value: string) {
  return Buffer.from(value, 'utf-8').toString('base64url');
}

function fromBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf-8');
}

function safeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function resolveGoogleOAuthStateSecret() {
  const explicitSecret = process.env.GOOGLE_OAUTH_STATE_SECRET?.trim();

  if (explicitSecret) {
    return explicitSecret;
  }

  if (isProduction()) {
    return undefined;
  }

  return process.env.GOOGLE_CLIENT_SECRET?.trim();
}

function isProduction() {
  return process.env.NODE_ENV === 'production';
}