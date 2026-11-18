import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { sessionToken } from '../../infrastructure/api/session-token';
import { AuthContext } from './auth-context';
import type { AuthContextValue, AuthStatus } from './auth-context';
import { authApi } from './services/auth-api';
import type { LoginCredentials, SessionProfile } from './types';

// Mantiene la sesión del usuario y la recupera al recargar si hay un token guardado.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() => (sessionToken.get() ? 'loading' : 'anonymous'));

  const endSession = useCallback(() => {
    setSession(null);
    setStatus('anonymous');
  }, []);

  useEffect(() => sessionToken.onExpired(endSession), [endSession]);

  useEffect(() => {
    if (!sessionToken.get()) return;
    let cancelled = false;
    authApi.me()
      .then((profile) => {
        if (cancelled) return;
        setSession(profile);
        setStatus('authenticated');
      })
      .catch(() => {
        if (!cancelled) endSession();
      });
    return () => {
      cancelled = true;
    };
  }, [endSession]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { accessToken, ...profile } = await authApi.login(credentials);
    sessionToken.set(accessToken);
    setSession(profile);
    setStatus('authenticated');
    return profile;
  }, []);

  const logout = useCallback(() => {
    sessionToken.clear();
    endSession();
  }, [endSession]);

  const value = useMemo<AuthContextValue>(() => {
    const permissions = new Set(session?.user.permissions);
    return { status, session, login, logout, hasPermission: (permission) => permissions.has(permission) };
  }, [login, logout, session, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
