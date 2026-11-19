// QA Sprint 1 · HU-54 Asignar y quitar roles al usuario · nivel unitario.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRoleAssignmentService } from '../../../src/modules/identity/services/user-role-assignment.service.js';
import { describeError, rejection } from './support.js';

const ROLES = [
  { id: 'r-admin', name: 'administrator', displayName: 'Administrador', category: 'STAFF', isActive: true },
  { id: 'r-manager', name: 'manager', displayName: 'Gerente', category: 'STAFF', isActive: true },
  { id: 'r-vet', name: 'veterinarian', displayName: 'Veterinario', category: 'STAFF', isActive: true },
  { id: 'r-tech', name: 'veterinary_technician', displayName: 'Técnico Veterinario', category: 'STAFF', isActive: true },
  { id: 'r-recep', name: 'receptionist', displayName: 'Recepcionista', category: 'STAFF', isActive: true },
  { id: 'r-cashier', name: 'cashier', displayName: 'Cajero', category: 'STAFF', isActive: true },
  { id: 'r-ware', name: 'warehouse_keeper', displayName: 'Bodeguero', category: 'STAFF', isActive: true },
  { id: 'r-client', name: 'client', displayName: 'Cliente', category: 'CLIENT', isActive: true },
];
const STAFF_NAMES = ROLES.filter((r) => r.category === 'STAFF').map((r) => r.name);

type Assignment = { id: string; roleId: string; expiresAt: Date | null };

// Simula Prisma con el estado de un usuario ("Carlos Pérez") en memoria.
function build(initialRoles: string[], options: { status?: string; otherAdmins?: number; exists?: boolean } = {}) {
  let seq = 0;
  const state = {
    status: options.status ?? 'ACTIVE',
    assignments: initialRoles.map((name) => ({ id: `ur-${seq++}`, roleId: ROLES.find((r) => r.name === name)!.id, expiresAt: null })) as Assignment[],
  };
  const roleOf = (id: string) => ROLES.find((r) => r.id === id)!;

  const prisma = {
    user: {
      findUnique: vi.fn(async () => {
        if (options.exists === false) return null;
        return {
          id: 'u-carlos',
          status: state.status,
          person: { firstName: 'Carlos', lastName: 'Pérez' },
          userRoles: state.assignments.map((a) => ({ ...a, role: { ...roleOf(a.roleId) } })),
        };
      }),
      count: vi.fn(async () => options.otherAdmins ?? 1),
    },
    role: {
      findMany: vi.fn(async ({ where }: { where: { category: string; name?: { in?: string[]; notIn?: string[] } } }) =>
        ROLES.filter((r) => r.category === where.category && r.isActive)
          .filter((r) => !where.name?.in || where.name.in.includes(r.name))
          .filter((r) => !where.name?.notIn || !where.name.notIn.includes(r.name))
          .sort((a, b) => a.displayName.localeCompare(b.displayName, 'es'))),
    },
    userRole: {
      create: vi.fn(async ({ data }: { data: { roleId: string } }) => {
        state.assignments.push({ id: `ur-${seq++}`, roleId: data.roleId, expiresAt: null });
      }),
      update: vi.fn(async ({ where }: { where: { id: string } }) => {
        const found = state.assignments.find((a) => a.id === where.id);
        if (found) found.expiresAt = null;
      }),
      deleteMany: vi.fn(async ({ where }: { where: { id: { in: string[] } } }) => {
        state.assignments = state.assignments.filter((a) => !where.id.in.includes(a.id));
      }),
    },
    $transaction: vi.fn(async (callback: (tx: unknown) => unknown) => callback(prisma)),
  };
  const service = new UserRoleAssignmentService(prisma as never);
  const roleNames = () => state.assignments.map((a) => roleOf(a.roleId).name).sort();
  return { service, prisma, state, roleNames };
}

describe('HU-54 Asignar y quitar roles (unitarias)', () => {
  let ctx: ReturnType<typeof build>;

  beforeEach(() => {
    ctx = build(['receptionist']);
  });

  it('CP-54-01 asigna un rol adicional (Recepcionista + Cajero)', async () => {
    const view = await ctx.service.update('u-carlos', ['receptionist', 'cashier'], 'admin-id');
    expect(ctx.roleNames()).toEqual(['cashier', 'receptionist']);
    expect(view.currentRoles.map((r) => r.displayName)).toEqual(['Cajero', 'Recepcionista']);
  });

  it('CP-54-02 quita un rol (queda solo Recepcionista)', async () => {
    ctx = build(['receptionist', 'cashier']);
    await ctx.service.update('u-carlos', ['receptionist'], 'admin-id');
    expect(ctx.roleNames()).toEqual(['receptionist']);
    expect(ctx.prisma.userRole.deleteMany).toHaveBeenCalledTimes(1);
  });

  it('CP-54-03 cambia de función (Recepcionista → Veterinario)', async () => {
    await ctx.service.update('u-carlos', ['veterinarian'], 'admin-id');
    expect(ctx.roleNames()).toEqual(['veterinarian']);
  });

  it('CP-54-04 impide quitar el único rol', async () => {
    const error = await rejection(ctx.service.update('u-carlos', [], 'admin-id'));
    expect(describeError(error)).toEqual({ status: 400, message: 'El usuario debe tener al menos un rol' });
    expect(ctx.roleNames()).toEqual(['receptionist']);
  });

  it('CP-54-04 trata una lista con solo espacios como vacía', async () => {
    const error = await rejection(ctx.service.update('u-carlos', ['  '], 'admin-id'));
    expect(error.statusCode).toBe(400);
  });

  it('CP-54-05 impide quitar el rol al último Administrador activo', async () => {
    ctx = build(['administrator'], { otherAdmins: 0 });
    const error = await rejection(ctx.service.update('u-carlos', ['manager'], 'admin-id'));
    expect(describeError(error)).toEqual({ status: 400, message: 'Debe existir al menos un Administrador activo' });
    expect(ctx.roleNames()).toEqual(['administrator']);
  });

  it('CP-54-06 permite quitar Administrador si queda exactamente otro activo (valor límite)', async () => {
    ctx = build(['administrator', 'manager'], { otherAdmins: 1 });
    await ctx.service.update('u-carlos', ['manager'], 'admin-id');
    expect(ctx.roleNames()).toEqual(['manager']);
  });

  it('CP-54-07 no ofrece como opción un rol ya asignado', async () => {
    const view = await ctx.service.get('u-carlos');
    expect(view.currentRoles.map((r) => r.name)).toEqual(['receptionist']);
    expect(view.availableRoles.map((r) => r.name)).not.toContain('receptionist');
    expect(view.availableRoles.map((r) => r.name)).not.toContain('client');
  });

  it('CP-54-08 impide modificar los roles de un usuario dado de baja', async () => {
    ctx = build(['receptionist'], { status: 'DEACTIVATED' });
    const error = await rejection(ctx.service.update('u-carlos', ['receptionist', 'cashier'], 'admin-id'));
    expect(describeError(error)).toEqual({ status: 400, message: 'No se pueden modificar los roles de un usuario dado de baja' });
  });

  it('CP-54-10 rechaza un rol que no es del personal', async () => {
    const error = await rejection(ctx.service.update('u-carlos', ['receptionist', 'client'], 'admin-id'));
    expect(describeError(error)).toEqual({ status: 400, message: 'Seleccione roles válidos del personal' });
    expect(ctx.roleNames()).toEqual(['receptionist']);
  });

  it('CP-54-11 responde 404 si el usuario no existe', async () => {
    ctx = build([], { exists: false });
    const error = await rejection(ctx.service.update('no-existe', ['cashier'], 'admin-id'));
    expect(describeError(error)).toEqual({ status: 404, message: 'Usuario no encontrado' });
  });

  it('CP-54-12 acepta los 7 roles del personal y ya no quedan roles disponibles (valor límite)', async () => {
    const view = await ctx.service.update('u-carlos', STAFF_NAMES, 'admin-id');
    expect(ctx.roleNames()).toEqual([...STAFF_NAMES].sort());
    expect(view.availableRoles).toEqual([]);
  });

  it('CP-54-01 ignora roles repetidos en la petición', async () => {
    await ctx.service.update('u-carlos', ['cashier', 'cashier', 'receptionist'], 'admin-id');
    expect(ctx.prisma.userRole.create).toHaveBeenCalledTimes(1);
  });

  it('CP-54-01 renueva un rol vencido en lugar de duplicarlo', async () => {
    ctx.state.assignments.push({ id: 'ur-old', roleId: 'r-cashier', expiresAt: new Date('2020-01-01') });
    await ctx.service.update('u-carlos', ['receptionist', 'cashier'], 'admin-id');
    expect(ctx.prisma.userRole.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'ur-old' } }));
    expect(ctx.prisma.userRole.create).not.toHaveBeenCalled();
  });
});
