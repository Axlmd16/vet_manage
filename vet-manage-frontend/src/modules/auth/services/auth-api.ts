import { getJson, postJson } from '../../../infrastructure/api/http-client';
import type { LoginCredentials, LoginResult, SessionProfile } from '../types';

export const authApi = {
  login(credentials: LoginCredentials) {
    return postJson<LoginResult, LoginCredentials>('/auth/login', credentials);
  },
  me() {
    return getJson<SessionProfile>('/auth/me');
  },
};
