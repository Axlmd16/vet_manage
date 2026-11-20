// QA Sprint 1 · HU-51 Registrar usuario · nivel unitario (Vitest, API compatible con Jest).
// Cada prueba lleva el ID del caso de la matriz (CP-51-xx).
import { Logger } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRegistrationService } from '../../../src/modules/identity/services/user-registration.service.js';
import { describeError, rejection, VALID_ID } from './support.js';

const ROLES = [
  { id: 'r-admin', name: 'administrator', displayName: 'Administrador', category: 'STAFF' },
  { id: 'r-manager', name: 'manager', displayName: 'Gerente', category: 'STAFF' },
  { id: 'r-vet', name: 'veterinarian', displayName: 'Veterinario', category: 'STAFF' },
  { id: 'r-recep', name: 'receptionist', displayName: 'Recepcionista', category: 'STAFF' },
  { id: 'r-cashier', name: 'cashier', displayName: 'Cajero', category: 'STAFF' },
  { id: 'r-client', name: 'client', displayName: 'Cliente', category: 'CLIENT' },
];

const valid = () => ({
  identification: VALID_ID.a,
  firstName: 'Pablo',
  lastName: 'Andrade',
  email: 'pablo.andrade@vetmanage.test',
  phone: '0991234567',
  roles: ['veterinarian'],
});

function build() {
  const tx = {
    person: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
    user: { create: vi.fn(), update: vi.fn() },
    userRole: { findMany: vi.fn(async () => []), create: vi.fn(async () => ({})), update: vi.fn(async () => ({})) },
  };
  tx.person.findUnique.mockResolvedValue(null);
  tx.person.findFirst.mockResolvedValue(null);
  tx.person.create.mockImplementation(async ({ data }) => ({ id: 'p-new', ...data }));
  tx.user.create.mockImplementation(async ({ data }) => ({ id: 'u-new', status: 'ACTIVE', ...data }));

  const prisma = {
    role: {
      findMany: vi.fn(async ({ where }: { where: { name: { in: string[] }; category: string } }) =>
        ROLES.filter((role) => where.name.in.includes(role.name) && role.category === where.category)),
    },
    $transaction: vi.fn((callback: (t: typeof tx) => unknown) => callback(tx)),
  };
  const hasher = { hash: vi.fn(async (password: string) => `hash:${password}`) };
  const mail = { send: vi.fn(async () => undefined) };
  const config = { get: vi.fn(() => 'http://localhost:5184') };
  const audit = { record: vi.fn(async () => undefined) };
  const service = new UserRegistrationService(prisma as never, hasher as never, mail as never, config as never, audit as never);
  return { service, tx, prisma, hasher, mail, audit };
}

describe('HU-51 Registrar usuario (unitarias)', () => {
  let ctx: ReturnType<typeof build>;

  beforeEach(() => {
    vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    ctx = build();
  });

  it('CP-51-01 registra con un rol: cuenta ACTIVE, contraseña temporal y correo de credenciales', async () => {
    const result = await ctx.service.register(valid(), 'admin-id');

    expect(result.message).toBe('Usuario registrado correctamente');
    expect(result.user).toMatchObject({ status: 'ACTIVE', credentialsSent: true, passwordAssigned: true });
    expect(result.user.roles).toEqual([{ name: 'veterinarian', displayName: 'Veterinario' }]);
    const created = ctx.tx.user.create.mock.calls[0][0].data;
    expect(created.mustChangePassword).toBe(true);
    expect(created.password).toMatch(/^hash:/);
    expect(ctx.mail.send).toHaveBeenCalledWith(expect.objectContaining({ to: 'pablo.andrade@vetmanage.test' }));
  });

  it('CP-51-02 registra con varios roles en una sola cuenta', async () => {
    const result = await ctx.service.register({ ...valid(), roles: ['manager', 'administrator'] }, 'admin-id');

    expect(ctx.tx.user.create).toHaveBeenCalledTimes(1);
    expect(ctx.tx.userRole.create).toHaveBeenCalledTimes(2);
    expect(result.user.roles.map((r) => r.name).sort()).toEqual(['administrator', 'manager']);
  });

  it('CP-51-03 no duplica a una persona que ya es Cliente y le agrega el rol Cajero', async () => {
    ctx.tx.person.findUnique.mockResolvedValue({
      id: 'p-ana', identification: VALID_ID.a, firstName: 'Ana', lastName: 'Ruiz', email: 'ana.ruiz@correo.test', phone: null,
      user: { id: 'u-ana', status: 'ACTIVE', password: 'hash:previa', userRoles: [{ role: { category: 'CLIENT' } }] },
    });

    const result = await ctx.service.register({ ...valid(), roles: ['cashier'] }, 'admin-id');

    expect(ctx.tx.person.create).not.toHaveBeenCalled();
    expect(ctx.tx.user.create).not.toHaveBeenCalled();
    expect(result.user.existingPerson).toBe(true);
    expect(ctx.tx.userRole.create).toHaveBeenCalledWith({ data: { userId: 'u-ana', roleId: 'r-cashier', assignedById: 'admin-id' } });
  });

  it('CP-51-04 acepta el teléfono vacío (opcional) y lo guarda como null', async () => {
    await ctx.service.register({ ...valid(), phone: '' }, 'admin-id');
    expect(ctx.tx.person.create.mock.calls[0][0].data.phone).toBeNull();
  });

  it('CP-51-05 rechaza el correo vacío con "Complete los campos obligatorios"', async () => {
    const error = await rejection(ctx.service.register({ ...valid(), email: '' }, 'admin-id'));
    expect(describeError(error)).toEqual({ status: 400, message: 'Complete los campos obligatorios' });
    expect(error.errors).toContain('email');
    expect(ctx.prisma.$transaction).not.toHaveBeenCalled();
  });

  it('CP-51-06 rechaza el registro sin roles', async () => {
    const error = await rejection(ctx.service.register({ ...valid(), roles: [] }, 'admin-id'));
    expect(describeError(error)).toEqual({ status: 400, message: 'Complete los campos obligatorios' });
    expect(error.errors).toContain('roles');
  });

  it('CP-51-07 rechaza una cédula ya registrada en el personal', async () => {
    ctx.tx.person.findUnique.mockResolvedValue({
      id: 'p-vet', user: { id: 'u-vet', password: 'x', userRoles: [{ role: { category: 'STAFF' } }] },
    });
    const error = await rejection(ctx.service.register(valid(), 'admin-id'));
    expect(describeError(error)).toEqual({ status: 409, message: 'Número de cédula ya registrado' });
  });

  it('CP-51-08 rechaza la cédula "11045"', async () => {
    const error = await rejection(ctx.service.register({ ...valid(), identification: '11045' }, 'admin-id'));
    expect(describeError(error)).toEqual({ status: 400, message: 'La cédula debe tener 10 dígitos válidos' });
  });

  it.each([
    ['9 dígitos', '110501000'],
    ['11 dígitos', '11050100011'],
  ])('CP-51-09 rechaza la cédula de %s (valor límite)', async (_, identification) => {
    const error = await rejection(ctx.service.register({ ...valid(), identification }, 'admin-id'));
    expect(describeError(error)).toEqual({ status: 400, message: 'La cédula debe tener 10 dígitos válidos' });
  });

  it.each([
    ['dígito verificador incorrecto', '1105010002'],
    ['provincia 25 inexistente', '2505010001'],
  ])('CP-51-10 rechaza la cédula con %s', async (_, identification) => {
    const error = await rejection(ctx.service.register({ ...valid(), identification }, 'admin-id'));
    expect(error.statusCode).toBe(400);
  });

  it('CP-51-11 rechaza un correo ya registrado', async () => {
    ctx.tx.person.findFirst.mockResolvedValue({ id: 'p-maria' });
    const error = await rejection(ctx.service.register({ ...valid(), email: 'mlopez@vetmanage.com' }, 'admin-id'));
    expect(describeError(error)).toEqual({ status: 409, message: 'El correo ya se encuentra registrado' });
  });

  it('CP-51-12 compara el correo sin distinguir mayúsculas (R-36)', async () => {
    ctx.tx.person.findFirst.mockResolvedValue({ id: 'p-maria' });
    const error = await rejection(ctx.service.register({ ...valid(), email: 'MLopez@VetManage.com' }, 'admin-id'));

    expect(error.statusCode).toBe(409);
    expect(ctx.tx.person.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { email: { equals: 'mlopez@vetmanage.com', mode: 'insensitive' } },
    }));
  });

  it('CP-51-12 traduce la violación de unicidad concurrente (P2002) en "correo ya registrado"', async () => {
    ctx.prisma.$transaction.mockRejectedValueOnce(Object.assign(new Error('unique'), { code: 'P2002', meta: { target: ['email'] } }));
    const error = await rejection(ctx.service.register(valid(), 'admin-id'));
    expect(describeError(error)).toEqual({ status: 409, message: 'El correo ya se encuentra registrado' });
  });

  it('CP-51-13 si falla el correo la cuenta queda creada y se avisa al Administrador', async () => {
    ctx.mail.send.mockRejectedValueOnce(new Error('SMTP caído'));
    const result = await ctx.service.register(valid(), 'admin-id');

    expect(ctx.tx.user.create).toHaveBeenCalledTimes(1);
    expect(result.user.credentialsSent).toBe(false);
    expect(result.message).toBe(
      'Usuario registrado, pero no se pudo enviar el correo. Verifique la dirección y reenvíe las credenciales',
    );
  });

  it('CP-51-16 acepta nombres de 100 caracteres (máximo)', async () => {
    const result = await ctx.service.register({ ...valid(), firstName: 'A'.repeat(100) }, 'admin-id');
    expect(result.user.firstName).toHaveLength(100);
  });

  it('CP-51-16 rechaza nombres de 101 caracteres', async () => {
    const error = await rejection(ctx.service.register({ ...valid(), lastName: 'A'.repeat(101) }, 'admin-id'));
    expect(describeError(error)).toEqual({ status: 400, message: 'Los nombres y apellidos no pueden superar 100 caracteres' });
  });

  it.each([['rol Cliente', 'client'], ['rol inexistente', 'superuser']])(
    'CP-51-17 rechaza el %s',
    async (_, role) => {
      const error = await rejection(ctx.service.register({ ...valid(), roles: [role] }, 'admin-id'));
      expect(describeError(error)).toEqual({ status: 400, message: 'Seleccione roles válidos del personal' });
    },
  );
});
