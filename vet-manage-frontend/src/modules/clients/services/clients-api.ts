import { getJson, postJson } from '../../../infrastructure/api/http-client';
import type { AssignableRole, RegisteredClient, RegisterClientInput } from '../types';

export const clientsApi = {
  assignableRoles() {
    return getJson<AssignableRole[]>('/clients/assignable-roles');
  },
  register(input: RegisterClientInput) {
    return postJson<RegisteredClient, RegisterClientInput>('/clients', input);
  },
};
