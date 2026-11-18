export type SessionRole = { name: string; displayName: string };

// Usuario de la sesión con sus roles y permisos vigentes.
export type SessionUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: SessionRole[];
  permissions: string[];
};

export type SessionProfile = { mustChangePassword: boolean; user: SessionUser };

export type LoginResult = SessionProfile & { accessToken: string };

// Resultado interno de abrir o renovar una sesión; el refresh token viaja solo en la cookie.
export type AuthSession = LoginResult & { refreshToken: string; refreshExpiresAt: Date };
