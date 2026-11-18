import { env } from '../../config/env';
import { isApiResponse } from './api-response';

// El token de acceso vive solo en memoria; el refresh token está en una cookie httpOnly.
let accessToken: string | null = null;
let pendingRefresh: Promise<unknown | null> | null = null;

const expiredListeners = new Set<() => void>();
const refreshedListeners = new Set<(session: unknown) => void>();

async function requestRefresh(): Promise<unknown | null> {
  const response = await fetch(`${env.apiUrl}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  }).catch(() => null);
  if (!response?.ok) return null;

  const body: unknown = await response.json().catch(() => null);
  const data = isApiResponse<{ accessToken?: string }>(body) ? body.data : undefined;
  if (!data?.accessToken) return null;

  accessToken = data.accessToken;
  return data;
}

// Varias pestañas comparten la cookie; el lock evita que renueven a la vez con el mismo token.
function refreshWithLock(): Promise<unknown | null> {
  if (typeof navigator !== 'undefined' && navigator.locks) {
    return navigator.locks.request('vetmanage-session-refresh', requestRefresh);
  }
  return requestRefresh();
}

export const sessionToken = {
  get: () => accessToken,
  set(token: string) {
    accessToken = token;
  },
  clear() {
    accessToken = null;
  },
  // Pide un nuevo token de acceso; las llamadas simultáneas comparten la misma petición.
  refresh(): Promise<unknown | null> {
    pendingRefresh ??= refreshWithLock()
      .then((session) => {
        if (session) refreshedListeners.forEach((listener) => listener(session));
        return session;
      })
      .finally(() => {
        pendingRefresh = null;
      });
    return pendingRefresh;
  },
  onExpired(listener: () => void) {
    expiredListeners.add(listener);
    return () => {
      expiredListeners.delete(listener);
    };
  },
  onRefreshed(listener: (session: unknown) => void) {
    refreshedListeners.add(listener);
    return () => {
      refreshedListeners.delete(listener);
    };
  },
  expire() {
    accessToken = null;
    expiredListeners.forEach((listener) => listener());
  },
};
