import { ApplicationError } from '../../../../shared/application/ApplicationError';
import { logger } from '../../../../shared/infra/observability/logger';

interface GoogleIdentity {
  email: string;
  name: string;
}

type GoogleTokenInfoResponse = {
  aud?: string;
  email?: string;
  name?: string;
};

export class GoogleTokenVerifier {
  async verify(credential: string): Promise<GoogleIdentity> {
    const normalizedCredential = credential.trim();
    const expectedAudience = process.env.GOOGLE_CLIENT_ID?.trim();

    if (!normalizedCredential) {
      throw new ApplicationError('Credential Google ausente.', 400, 'GOOGLE_CREDENTIAL_MISSING');
    }

    try {
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(normalizedCredential)}`);

      if (response.ok) {
        const payload = (await response.json()) as GoogleTokenInfoResponse;

        if (payload.email && payload.name && this.isValidAudience(payload.aud, expectedAudience)) {
          return {
            email: payload.email.toLowerCase(),
            name: payload.name,
          };
        }
      }
    } catch (error) {
      logger.warn({
        message: 'Google token verification failed before fallback.',
        route: 'google-token-verifier',
        code: 'GOOGLE_TOKEN_VERIFY_WARNING',
        error,
      });
    }

    if (canUseUnsafeGoogleAuthFallback()) {
      const fallbackIdentity = this.tryUnsafeDecode(normalizedCredential);

      if (fallbackIdentity) {
        return fallbackIdentity;
      }
    }

    throw new ApplicationError('Nao foi possivel validar o token do Google.', 401, 'GOOGLE_TOKEN_INVALID');
  }

  private tryUnsafeDecode(credential: string): GoogleIdentity | null {
    const jwtPayload = credential.split('.');

    if (jwtPayload.length >= 2) {
      const decoded = safeParseJson<GoogleTokenInfoResponse>(decodeBase64Url(jwtPayload[1]));

      if (decoded?.email && decoded?.name) {
        return {
          email: decoded.email.toLowerCase(),
          name: decoded.name,
        };
      }
    }

    const inlineJson = safeParseJson<GoogleTokenInfoResponse>(credential);

    if (inlineJson?.email && inlineJson?.name) {
      return {
        email: inlineJson.email.toLowerCase(),
        name: inlineJson.name,
      };
    }

    if (credential.includes('@')) {
      const email = credential.toLowerCase();
      return {
        email,
        name: email.split('@')[0],
      };
    }

    return null;
  }

  private isValidAudience(audience: string | undefined, expectedAudience: string | undefined) {
    if (!expectedAudience) {
      if (isProduction()) {
        throw new ApplicationError('GOOGLE_CLIENT_ID nao configurado para validacao em producao.', 500, 'GOOGLE_CLIENT_ID_MISSING');
      }

      return true;
    }

    return audience === expectedAudience;
  }
}

function canUseUnsafeGoogleAuthFallback() {
  return !isProduction() && process.env.ALLOW_UNSAFE_GOOGLE_AUTH_DEV === 'true';
}

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function safeParseJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return Buffer.from(padded, 'base64').toString('utf-8');
}
