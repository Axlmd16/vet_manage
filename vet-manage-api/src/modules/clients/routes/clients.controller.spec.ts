import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { success } from '../../../common/errors/api-response.js';
import { PERMISSIONS_METADATA } from '../../identity/decorators/require-permissions.decorator.js';
import { ClientsController } from './clients.controller.js';

function build() {
  const list = vi.fn(async () => ({
    items: [],
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  }));
  const service = { list };
  return { controller: new ClientsController(service as never), service, list };
}

describe('ClientsController', () => {
  let ctx: ReturnType<typeof build>;

  beforeEach(() => {
    ctx = build();
  });

  it('exige el permiso clients:read en el listado', () => {
    const listMethod = Object.getOwnPropertyDescriptor(ClientsController.prototype, 'list')?.value;
    const permissions = Reflect.getMetadata(PERMISSIONS_METADATA, listMethod as object);

    expect(permissions).toEqual(['clients:read']);
  });

  it('delega los parámetros de query y devuelve la envoltura success', async () => {
    const query = { page: 2, pageSize: 10, search: 'mar', status: 'ACTIVE' as const };

    const result = await ctx.controller.list(query);

    expect(ctx.list).toHaveBeenCalledWith(query);
    expect(result).toEqual(success({
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0,
    }));
  });
});
