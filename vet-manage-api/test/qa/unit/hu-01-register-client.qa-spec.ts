// QA Sprint 1 · HU-01 Registrar datos del cliente · nivel unitario.
// Los mensajes esperados son los textos exactos de los criterios de aceptación de la HU-01.
import { Logger } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClientRegistrationService } from '../../../src/modules/identity/services/client-registration.service.js';
import { describeError, rejection, VALID_ID } from './support.js';

const HU01 = {
  registered: 'Cliente registrado exitosamente',
  missing: 'Por favor, complete todos los campos obligatorios',
  identificationTaken: 'Número de cédula ya registrado',
  invalidIdentification: 'Número de cédula no válido',
  invalidContact: 'Por favor, ingrese un correo y número de teléfono válido',
};

const valid = () => ({
  identification: VALID_ID.a,
  firstName: 'Mateo',
  lastName: 'Cueva',
  email: 'mateo.cueva@correo.test',
  phone: '0987654321',
  address: 'Av. Orillas del Zamora',
});

function build() {
  const tx = {
    person: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
    user: { create: vi.fn(), update: vi.fn() },
    userRole: { findMany: vi.fn(async () => []), create: vi.fn(async () => ({})), update: vi.fn(async () => ({})) },
    client: { upsert: vi.fn(async ({ create }: { create: { personId: string } }) => ({ id: 'c-new', ...create })) },
  };
  tx.person.findUnique.mockResolvedValue(null);
  tx.person.findFirst.mockResolvedValue(null);
  tx.person.create.mockImplementation(async ({ data }) => ({ id: 'p-new', ...data }));
  tx.user.create.mockImplementation(async () => ({ id: 'u-new', status: 'ACTIVE' }));

  const prisma = {
    role: { findFirst: vi.fn(async () => ({ id: 'r-client', name: 'client', displayName: 'Cliente' })) },
    $transaction: vi.fn((callback: (t: typeof tx) => unknown) => callback(tx)),
  };
  const hasher = { hash: vi.fn(async (value: string) => `hash:${value}`) };
  const mail = { send: vi.fn(async () => undefined) };
  const config = { get: vi.fn(() => 'http://localhost:5184') };
  const service = new ClientRegistrationService(prisma as never, hasher as never, mail as never, config as never);
  return { service, tx, prisma };
}

describe('HU-01 Registrar datos del cliente (unitarias)', () => {
  let ctx: ReturnType<typeof build>;

  beforeEach(() => {
    vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    ctx = build();
  });

  it('CP-01-01 registra un cliente válido en estado Activo con el mensaje de la HU', async () => {
    const result = await ctx.service.register(valid(), 'recep-id');
    expect(result.client.status).toBe('ACTIVE');
    expect(result.message).toBe(HU01.registered);
  });

  it('CP-01-02 acepta la dirección vacía (opcional) y la guarda como null', async () => {
    const result = await ctx.service.register({ ...valid(), address: '' }, 'recep-id');
    expect(result.client.address).toBeNull();
  });

  it('CP-01-04 rechaza los campos obligatorios vacíos con el mensaje de la HU', async () => {
    const error = await rejection(ctx.service.register({ identification: '', firstName: '', lastName: '', email: '', phone: '' }, 'recep-id'));
    expect(describeError(error)).toEqual({ status: 400, message: HU01.missing });
    expect(error.errors).toEqual(expect.arrayContaining(['identification', 'firstName', 'lastName', 'email']));
  });

  it('CP-01-05 rechaza el registro sin teléfono de contacto (obligatorio en la HU)', async () => {
    const error = await rejection(ctx.service.register({ ...valid(), phone: '' }, 'recep-id'));
    expect(describeError(error)).toEqual({ status: 400, message: HU01.missing });
    expect(error.errors).toContain('phone');
  });

  it('CP-01-06 rechaza una cédula que ya pertenece a otro cliente', async () => {
    ctx.tx.person.findUnique.mockResolvedValue({
      id: 'p-pedro', identification: VALID_ID.a, firstName: 'Pedro', lastName: 'Castillo', email: 'pedro.castillo@correo.test',
      phone: '0987000002', address: null,
      user: null,
    });
    const error = await rejection(ctx.service.register(valid(), 'recep-id'));
    expect(describeError(error)).toEqual({ status: 409, message: HU01.identificationTaken });
  });

  it('CP-01-06 rechaza una cédula que pertenece al personal', async () => {
    ctx.tx.person.findUnique.mockResolvedValue({ id: 'p-staff', user: { id: 'u', password: 'x', userRoles: [{ role: { category: 'STAFF' } }] } });
    const error = await rejection(ctx.service.register(valid(), 'recep-id'));
    expect(describeError(error)).toEqual({ status: 409, message: HU01.identificationTaken });
  });

  it('CP-01-07 rechaza una cédula alfanumérica con "Número de cédula no válido"', async () => {
    const error = await rejection(ctx.service.register({ ...valid(), identification: '11050A0001' }, 'recep-id'));
    expect(describeError(error)).toEqual({ status: 400, message: HU01.invalidIdentification });
    expect(error.errors).toEqual(['identification']);
  });

  it.each([['9 dígitos', '110501000'], ['11 dígitos', '11050100011']])(
    'CP-01-08 rechaza una cédula de %s (valor límite)',
    async (_, identification) => {
      const error = await rejection(ctx.service.register({ ...valid(), identification }, 'recep-id'));
      expect(describeError(error)).toEqual({ status: 400, message: HU01.invalidIdentification });
    },
  );

  it('CP-01-09 rechaza un correo sin formato usuario@dominio.com', async () => {
    const error = await rejection(ctx.service.register({ ...valid(), email: 'mateo.correo.test' }, 'recep-id'));
    expect(describeError(error)).toEqual({ status: 400, message: HU01.invalidContact });
  });

  it('CP-01-10 rechaza un teléfono con letras', async () => {
    const error = await rejection(ctx.service.register({ ...valid(), phone: '09876ABCDE' }, 'recep-id'));
    expect(describeError(error)).toEqual({ status: 400, message: HU01.invalidContact });
  });

  it.each([['9 dígitos', '098765432'], ['11 dígitos', '09876543210']])(
    'CP-01-11 rechaza un teléfono de %s (debe tener exactamente 10)',
    async (_, phone) => {
      const error = await rejection(ctx.service.register({ ...valid(), phone }, 'recep-id'));
      expect(describeError(error)).toEqual({ status: 400, message: HU01.invalidContact });
    },
  );

  it('CP-01-12 rechaza un teléfono de 10 dígitos con prefijo inválido', async () => {
    const error = await rejection(ctx.service.register({ ...valid(), phone: '1987654321' }, 'recep-id'));
    expect(describeError(error)).toEqual({ status: 400, message: HU01.invalidContact });
  });

  it('CP-01-13 acepta un teléfono de exactamente 10 dígitos con prefijo 09 (valor límite)', async () => {
    const result = await ctx.service.register({ ...valid(), phone: '0999999999' }, 'recep-id');
    expect(result.client.phone).toBe('0999999999');
  });

  it('CP-01-15 acepta una dirección de 255 caracteres (máximo)', async () => {
    const result = await ctx.service.register({ ...valid(), address: 'x'.repeat(255) }, 'recep-id');
    expect(result.client.address).toHaveLength(255);
  });

  it('CP-01-15 rechaza una dirección de 256 caracteres', async () => {
    const error = await rejection(ctx.service.register({ ...valid(), address: 'x'.repeat(256) }, 'recep-id'));
    expect(describeError(error)).toEqual({ status: 400, message: 'Dirección no válida' });
  });

  it('CP-01-01 rechaza un correo que ya pertenece a otra persona', async () => {
    ctx.tx.person.findFirst.mockResolvedValue({ id: 'p-otro' });
    const error = await rejection(ctx.service.register(valid(), 'recep-id'));
    expect(error.statusCode).toBe(409);
  });
});
