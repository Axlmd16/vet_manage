import { getJson, postJson } from '../../../infrastructure/api/http-client';
import type { AssignableRole, RegisteredUser, RegisterUserInput, UserPage, UserQuery } from '../types';

export const usersApi = {
  assignableRoles() {
    return getJson<AssignableRole[]>('/users/assignable-roles');
  },
  list(query: UserQuery = {}) {
    const params = new URLSearchParams();
    const values: [string, string | undefined][] = [
      ['q', query.q?.trim()],
      ['role', query.role?.trim()],
      ['status', query.status],
      ['page', query.page === undefined ? undefined : String(query.page)],
      ['pageSize', query.pageSize === undefined ? undefined : String(query.pageSize)],
    ];

    for (const [key, value] of values) {
      if (value) params.set(key, value);
    }

    const suffix = params.toString();
    return getJson<UserPage>(`/users${suffix ? `?${suffix}` : ''}`);
  },
  register(input: RegisterUserInput) {
    return postJson<RegisteredUser, RegisterUserInput>('/users', input);
  },
};
