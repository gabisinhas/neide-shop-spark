const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const SESSION_TOKEN_STORAGE_KEY = '@NeideShop:accessToken';
let refreshRequest: Promise<string | null> | null = null;

export function buildApiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

type ApiErrorPayload = {
  message?: string;
  code?: string;
  traceId?: string;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly traceId?: string;

  constructor(message: string, status: number, code?: string, traceId?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.traceId = traceId;
  }
}

export function getStoredAccessToken() {
  return localStorage.getItem(SESSION_TOKEN_STORAGE_KEY);
}

export function setStoredAccessToken(token: string) {
  localStorage.setItem(SESSION_TOKEN_STORAGE_KEY, token);
}

export function clearStoredAccessToken() {
  localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY);
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const executeRequest = async (accessToken?: string | null) => {
    const requestTraceId = crypto.randomUUID();
    const headers = new Headers(init?.headers ?? {});

    if (!headers.has('Content-Type') && init?.body && !(init.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    headers.set('x-request-id', requestTraceId);

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const response = await fetch(buildApiUrl(path), {
      ...init,
      headers,
      credentials: 'include',
    });

    return {
      requestTraceId,
      response,
      payload: (await response.json().catch(() => null)) as ApiErrorPayload | T | null,
    };
  };

  const requestTraceId = crypto.randomUUID();
  const token = getStoredAccessToken();

  try {
    let { response, payload } = await executeRequest(token);

    if (response.status === 401 && shouldAttemptTokenRefresh(path)) {
      const refreshedAccessToken = await refreshAccessToken();

      if (refreshedAccessToken) {
        const retriedRequest = await executeRequest(refreshedAccessToken);
        response = retriedRequest.response;
        payload = retriedRequest.payload;
      }
    }

    if (!response.ok) {
      const errorPayload = payload as ApiErrorPayload | null;
      const traceId = errorPayload?.traceId || response.headers.get('x-request-id') || requestTraceId;
      const message = errorPayload?.message || `Falha ao processar a requisicao. Trace: ${traceId}`;
      throw new ApiError(message, response.status, errorPayload?.code, traceId);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error({ scope: 'apiRequest', path, status: error.status, code: error.code, traceId: error.traceId, message: error.message });
      throw error;
    }

    console.error({ scope: 'apiRequest', path, traceId: requestTraceId, error });
    throw new ApiError(`Falha de rede ao comunicar com a API. Trace: ${requestTraceId}`, 0, 'NETWORK_ERROR', requestTraceId);
  }
}

async function refreshAccessToken() {
  if (!refreshRequest) {
    refreshRequest = (async () => {
      try {
        const response = await fetch(buildApiUrl('/auth/refresh'), {
          method: 'POST',
          credentials: 'include',
          headers: {
            'x-request-id': crypto.randomUUID(),
          },
        });

        if (!response.ok) {
          clearStoredAccessToken();
          return null;
        }

        const payload = (await response.json().catch(() => null)) as { accessToken?: string } | null;
        const accessToken = payload?.accessToken?.trim();

        if (!accessToken) {
          clearStoredAccessToken();
          return null;
        }

        setStoredAccessToken(accessToken);
        return accessToken;
      } catch (error) {
        console.error({ scope: 'refreshAccessToken', error });
        clearStoredAccessToken();
        return null;
      } finally {
        refreshRequest = null;
      }
    })();
  }

  return refreshRequest;
}

function shouldAttemptTokenRefresh(path: string) {
  const normalizedPath = path.trim();

  if (!normalizedPath) {
    return false;
  }

  if (normalizedPath === '/auth/me') {
    return true;
  }

  return ![
    '/auth/login',
    '/auth/register',
    '/auth/logout',
    '/auth/refresh',
    '/auth/google',
    '/auth/google/exchange',
    '/auth/forgot-password',
    '/auth/reset-password',
  ].some((blockedPath) => normalizedPath === blockedPath || normalizedPath.startsWith(`${blockedPath}/`));
}

export function formatApiError(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError) {
    return error.traceId ? `${error.message} Trace: ${error.traceId}` : error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}