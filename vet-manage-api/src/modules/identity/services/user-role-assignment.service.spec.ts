import { describe, expect, it, vi } from 'vitest';
import { ApiException } from '../../../common/errors/api-exception.js';
import { ROLE_ASSIGNMENT_MESSAGES, UserRoleAssignmentService } from './user-role-assignment.service.js';

type Tx = {
  user: { findUnique: ReturnType<typeof vi.fn>; count: ReturnType<typeof vi.fn> };
  role: { findMany: ReturnType<typeof vi.fn> };
  userRole: { create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>; deleteMany: ReturnType<typeof vi.fn> };
};

function build(tx: Tx, view: unknown) {
  const prisma = {
    $transaction: vi.fn(async (run: (client: Tx) => Promise<void>) => run(tx)),
    user: { findUnique: vi.fn() },
    role: { findMany: vi.fn() },
  };
  const service = new UserRoleAssignmentService(prisma as never);
  const getSpy = vi.spyOn(service, 'get').mockResolvedValue(view as never);
  return { prisma, tx, service, getSpy };
}

const now = new Date('2026-11-19T12:00:00Z');

function baseUser(overrides: Partial<{ status: string; userRoles: unknown[] }> = {}) {
  return {
    id: 'u-1',
    status: 'ACTIVE',
    userRoles: [
      {
        id: 'ur-rec',
        roleId: 'role-rec',
        expiresAt: null,
        role: { name: 'receptionist', isActive: true },
      },
      ...(overrides.userRoles ?? []),
    ],
    ...overrides,
  };
}

describe('UserRoleAssignmentService.update', () => {
  it('asigna un rol adicional conservando los actuales', async () => {
    const tx: Tx = {
      user: {
        findUnique: vi.fn().mockResolvedValue(baseUser()),
        count: vi.fn(),
      },
      role: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'role-rec', name: 'receptionist' },
          { id: 'role-cash', name: 'cashier' },
        ]),
      },
      userRole: { create: vi.fn(), update: vi.fn(), deleteMany: vi.fn() },
    };
    const view = { user: { id: 'u-1' }, currentRoles: [], availableRoles: [] };
    const { service } = build(tx, view);

    const result = await service.update('u-1', ['receptionist', 'cashier'], 'admin-1');

    expect(result).toBe(view);
    expect(tx.userRole.create).toHaveBeenCalledWith({
      data: { userId: 'u-1', roleId: 'role-cash', assignedById: 'admin-1' },
    });
    expect(tx.userRole.deleteMany).not.toHaveBeenCalled();
  });

  it('quita un rol y conserva los demás', async () => {
    const tx: Tx = {
      user: {
        findUnique: vi.fn().mockResolvedValue(baseUser({
          userRoles: [
            { id: 'ur-rec', roleId: 'role-rec', expiresAt: null, role: { name: 'receptionist', isActive: true } },
            { id: 'ur-cash', roleId: 'role-cash', expiresAt: null, role: { name: 'cashier', isActive: true } },
          ],
        })),
        count: vi.fn(),
      },
      role: { findMany: vi.fn().mockResolvedValue([{ id: 'role-rec', name: 'receptionist' }]) },
      userRole: { create: vi.fn(), update: vi.fn(), deleteMany: vi.fn() },
    };
    const { service } = build(tx, {});

    await service.update('u-1', ['receptionist'], 'admin-1');

    expect(tx.userRole.deleteMany).toHaveBeenCalledWith({ where: { id: { in: ['ur-cash'] } } });
  });

  it('cambia de función reemplazando el rol y reactiva asignaciones vencidas', async () => {
    vi.setSystemTime(now);
    const tx: Tx = {
      user: {
        findUnique: vi.fn().mockResolvedValue(baseUser({
          userRoles: [
            { id: 'ur-rec', roleId: 'role-rec', expiresAt: null, role: { name: 'receptionist', isActive: true } },
            { id: 'ur-vet', roleId: 'role-vet', expiresAt: new Date('2026-11-01T00:00:00Z'), role: { name: 'veterinarian', isActive: true } },
          ],
        })),
        count: vi.fn(),
      },
      role: { findMany: vi.fn().mockResolvedValue([{ id: 'role-vet', name: 'veterinarian' }]) },
      userRole: { create: vi.fn(), update: vi.fn(), deleteMany: vi.fn() },
    };
    const { service } = build(tx, {});

    await service.update('u-1', ['veterinarian'], 'admin-1');

    expect(tx.userRole.update).toHaveBeenCalledWith({
      where: { id: 'ur-vet' },
      data: { expiresAt: null, assignedById: 'admin-1' },
    });
    expect(tx.userRole.deleteMany).toHaveBeenCalledWith({ where: { id: { in: ['ur-rec'] } } });
    vi.useRealTimers();
  });

  it('rechaza guardar sin roles efectivos', async () => {
    const tx: Tx = {
      user: { findUnique: vi.fn(), count: vi.fn() },
      role: { findMany: vi.fn() },
      userRole: { create: vi.fn(), update: vi.fn(), deleteMany: vi.fn() },
    };
    const { service } = build(tx, {});

    await expect(service.update('u-1', ['  '], 'admin-1')).rejects.toMatchObject({
      statusCode: 400,
      message: ROLE_ASSIGNMENT_MESSAGES.atLeastOne,
    });
    expect(tx.user.findUnique).not.toHaveBeenCalled();
  });

  it('rechaza quitar el último administrador activo', async () => {
    vi.setSystemTime(now);
    const tx: Tx = {
      user: {
        findUnique: vi.fn().mockResolvedValue(baseUser({
          userRoles: [
            { id: 'ur-admin', roleId: 'role-admin', expiresAt: null, role: { name: 'administrator', isActive: true } },
          ],
        })),
        count: vi.fn().mockResolvedValue(0),
      },
      role: { findMany: vi.fn().mockResolvedValue([{ id: 'role-rec', name: 'receptionist' }]) },
      userRole: { create: vi.fn(), update: vi.fn(), deleteMany: vi.fn() },
    };
    const { service } = build(tx, {});

    await expect(service.update('u-1', ['receptionist'], 'admin-1')).rejects.toMatchObject({
      statusCode: 400,
      message: ROLE_ASSIGNMENT_MESSAGES.lastAdmin,
    });
    expect(tx.userRole.create).not.toHaveBeenCalled();
    expect(tx.userRole.deleteMany).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('rechaza modificar roles de un usuario dado de baja', async () => {
    const tx: Tx = {
      user: { findUnique: vi.fn().mockResolvedValue(baseUser({ status: 'DEACTIVATED' })), count: vi.fn() },
      role: { findMany: vi.fn().mockResolvedValue([{ id: 'role-rec', name: 'receptionist' }]) },
      userRole: { create: vi.fn(), update: vi.fn(), deleteMany: vi.fn() },
    };
    const { service } = build(tx, {});

    await expect(service.update('u-1', ['receptionist'], 'admin-1')).rejects.toMatchObject({
      statusCode: 400,
      message: ROLE_ASSIGNMENT_MESSAGES.deactivated,
    });
    expect(tx.userRole.create).not.toHaveBeenCalled();
  });

  it('rechaza roles no asignables', async () => {
    const tx: Tx = {
      user: { findUnique: vi.fn().mockResolvedValue(baseUser()), count: vi.fn() },
      role: { findMany: vi.fn().mockResolvedValue([]) },
      userRole: { create: vi.fn(), update: vi.fn(), deleteMany: vi.fn() },
    };
    const { service } = build(tx, {});

    const error = await service.update('u-1', ['client'], 'admin-1').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiException);
    expect((error as ApiException).message).toBe(ROLE_ASSIGNMENT_MESSAGES.invalidRoles);
  });
});
