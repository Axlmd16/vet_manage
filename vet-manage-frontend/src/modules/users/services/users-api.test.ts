import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getJson } from '../../../infrastructure/api/http-client';
import type { UserPage } from '../types';
import { usersApi } from './users-api';

vi.mock('../../../infrastructure/api/http-client', () => ({
  getJson: vi.fn(),
  postJson: vi.fn(),
}));

const emptyPage: UserPage = { items: [], total: 0, page: 1, pageSize: 20 };

describe('usersApi.list', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getJson).mockResolvedValue(emptyPage);
  });

  it('envía búsqueda, filtros y paginación como parámetros de consulta', async () => {
    await usersApi.list({
      q: 'Pérez',
      role: 'veterinarian',
      status: 'ACTIVE',
      page: 2,
      pageSize: 20,
    });

    expect(getJson).toHaveBeenCalledWith(
      '/users?q=P%C3%A9rez&role=veterinarian&status=ACTIVE&page=2&pageSize=20',
    );
  });

  it('omite los parámetros vacíos y conserva la paginación', async () => {
    await usersApi.list({ q: '   ', role: '', page: 1, pageSize: 20 });

    expect(getJson).toHaveBeenCalledWith('/users?page=1&pageSize=20');
  });

  it('permite consultar sin parámetros', async () => {
    await usersApi.list();

    expect(getJson).toHaveBeenCalledWith('/users');
  });
});
