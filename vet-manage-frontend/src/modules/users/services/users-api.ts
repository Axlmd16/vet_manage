import { getJson, postJson } from '../../../infrastructure/api/http-client';
import type { AssignableRole, RegisteredUser, RegisterUserInput } from '../types';

export const usersApi = {
  assignableRoles() {
    return getJson<AssignableRole[]>('/users/assignable-roles');
  },
  register(input: RegisterUserInput) {
    return postJson<RegisteredUser, RegisterUserInput>('/users', input);
  },
};
