import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ListClientsQueryDto } from '../dtos/list-clients-query.dto.js';
import { ClientsRepository, type ClientWithPerson } from './clients.repository.js';

const clientRecord = (): ClientWithPerson => ({
  id: 'c1',
  personId: 'p1',
  status: 'ACTIVE',
  createdAt: new Date('2026-11-19T12:00:00.000Z'),
  person: {
    identification: '1710034065',
    firstName: 'María',
    lastName: 'López',
    email: 'maria@example.com',
    phone: '0991234567',
    address: 'Av. Principal 123',
    user: {
      userRoles: [{ role: { name: 'client', displayName: 'Cliente' } }],
    },
  },
});

function build() {
  const findMany = vi.fn(async () => [clientRecord()]);
  const count = vi.fn(async () => 1);
  const prisma = {
    client: { findMany, count },
    $transaction: vi.fn(async (operations: Promise<unknown>[]) => Promise.all(operations)),
  };
  const repository = new ClientsRepository(prisma as never);
  return { repository, prisma, findMany, count };
}

const query = (overrides: Partial<ListClientsQueryDto> = {}): ListClientsQueryDto => ({
  page: 1,
  pageSize: 20,
  ...overrides,
});

describe('ClientsRepository', () => {
  let ctx: ReturnType<typeof build>;

  beforeEach(() => {
    ctx = build();
  });

  it('aplica paginación por defecto y orden por apellido y nombre', async () => {
    const result = await ctx.repository.findClients(query());

    const args = ctx.findMany.mock.calls[0][0];
    expect(args.skip).toBe(0);
    expect(args.take).toBe(20);
    expect(args.orderBy).toEqual([{ person: { lastName: 'asc' } }, { person: { firstName: 'asc' } }]);
    expect(args.where.status).toBeUndefined();
    expect(args.where.person.OR).toBeUndefined();
    expect(result).toEqual({ clients: [clientRecord()], total: 1 });
  });

  it('combina búsqueda insensible, filtro por estado y paginación explícita', async () => {
    await ctx.repository.findClients(query({ page: 2, pageSize: 10, search: '  mar  ', status: 'ACTIVE' }));

    const args = ctx.findMany.mock.calls[0][0];
    expect(args.skip).toBe(10);
    expect(args.take).toBe(10);
    expect(args.where.status).toBe('ACTIVE');
    expect(args.where.person.OR).toEqual([
      { identification: { contains: 'mar', mode: 'insensitive' } },
      { firstName: { contains: 'mar', mode: 'insensitive' } },
      { lastName: { contains: 'mar', mode: 'insensitive' } },
    ]);
    expect(ctx.count).toHaveBeenCalledWith({ where: args.where });
  });

  it('filtra únicamente roles client activos no vencidos', async () => {
    await ctx.repository.findClients(query());

    const args = ctx.findMany.mock.calls[0][0];
    expect(args.where.person.user.userRoles.some).toEqual({
      role: { name: 'client', isActive: true },
      OR: [{ expiresAt: null }, { expiresAt: { gt: expect.any(Date) } }],
    });
    expect(args.include.person.include.user.include.userRoles.where).toEqual({
      role: { isActive: true },
      OR: [{ expiresAt: null }, { expiresAt: { gt: expect.any(Date) } }],
    });
  });

  it('devuelve lista vacía y total cero cuando no hay coincidencias', async () => {
    ctx.findMany.mockResolvedValue([]);
    ctx.count.mockResolvedValue(0);

    const result = await ctx.repository.findClients(query({ search: 'nadie' }));

    expect(result).toEqual({ clients: [], total: 0 });
  });
});
