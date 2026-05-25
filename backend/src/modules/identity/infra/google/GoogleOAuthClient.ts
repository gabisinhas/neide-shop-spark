import { ApplicationError } from '../../../../shared/application/ApplicationError';

type GoogleTokenResponse = {
  error?: string;
  error_description?: string;
  id_token?: string;
};

export class GoogleOAuthClient {
  private readonly clientId = readRequiredEnv('GOOGLE_CLIENT_ID');
  private readonly clientSecret = readRequiredEnv('GOOGLE_CLIENT_SECRET');
  private readonly backendBaseUrl = readRequiredEnv('APP_BASE_URL');
  private readonly frontendAppUrl = readRequiredEnv('FRONTEND_APP_URL');
  private readonly frontendCallbackPath = process.env.FRONTEND_GOOGLE_CALLBACK_PATH?.trim() || '/entrar/google/callback';

  createAuthorizationUrl(state: string) {
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.search = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.getRedirectUri(),
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
      state,
    }).toString();
    return url.toString();
  }

  async exchangeCodeForIdToken(code: string) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.getRedirectUri(),
        grant_type: 'authorization_code',
      }).toString(),
    });

    const payload = (await response.json().catch(() => null)) as GoogleTokenResponse | null;

    if (!response.ok) {
      throw new ApplicationError(
        payload?.error_description || 'Nao foi possivel concluir o login com Google.',
        502,
        payload?.error || 'GOOGLE_OAUTH_TOKEN_EXCHANGE_FAILED',
      );
    }

    if (!payload?.id_token) {
      throw new ApplicationError('Google nao retornou id_token no callback.', 502, 'GOOGLE_OAUTH_ID_TOKEN_MISSING');
    }

    return payload.id_token;
  }

  buildFrontendCallbackUrl(params: { token?: string; redirectTo?: string; error?: string }) {
    const url = new URL(this.frontendCallbackPath, normalizeBaseUrl(this.frontendAppUrl));

    if (params.token) {
      url.searchParams.set('token', params.token);
    }

    if (params.redirectTo) {
      url.searchParams.set('redirectTo', params.redirectTo);
    }

    if (params.error) {
      url.searchParams.set('error', params.error);
    }

    return url.toString();
  }

  getRedirectUri() {
    const configuredRedirectUri = process.env.GOOGLE_REDIRECT_URI?.trim();

    if (configuredRedirectUri) {
      return configuredRedirectUri;
    }

    return new URL('/api/auth/google/callback', normalizeBaseUrl(this.backendBaseUrl)).toString();
  }
}

function readRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new ApplicationError(`Variavel de ambiente ${name} nao configurada.`, 500, 'ENVIRONMENT_VARIABLE_MISSING');
  }

  return value;
}

function normalizeBaseUrl(value: string) {
  return value.endsWith('/') ? value : `${value}/`;
}