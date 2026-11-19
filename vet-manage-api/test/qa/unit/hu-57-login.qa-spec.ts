// QA Sprint 1 · HU-57 Iniciar sesión (login y bloqueo al 5.º intento) · nivel unitario.
import { Logger } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../src/modules/identity/services/auth.service.js';
import { describeError, rejection } from './support.js';

const NOW = new Date('2026-11-19T15:00:00Z');
const MINUTE = 60_000;

type StoredUser = {
  id: string; password: string | null; status: string; isLocked: boolean; lockedAt: Date | null; failedLoginAttempts: number;
};

function build(user: Partial<StoredUser> | null = {}) {
  const stored: StoredUser | null = user && {
    id: 'u-vet', password: 'hash:QaVet2026', status: 'ACTIVE', isLocked: false, lockedAt: null, failedLoginAttempts: 0, ...user,
  };
  const prisma = {
    user: {
      findFirst: vi.fn(async () => (stored ? { ...stored } : null)),
      update: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        if (!stored) return {};
        const increment = (data.failedLoginAttempts as { increment?: number } | undefined)?.increment;
        if (increment) stored.failedLoginAttempts += increment;
        else Object.assign(stored, data);
        return { ...stored };
      }),
    },
  };
  const hasher = {
    hash: vi.fn(async (value: string) => `hash:${value}`),
    verify: vi.fn(async (value: string, hash: string) => hash === `hash:${value}`),
  };
  const tokens = { issue: vi.fn(async () => 'jwt-de-prueba') };
  const access = {
    getSessionProfile: vi.fn(async () => ({ mustChangePassword: false, user: { id: 'u-vet' }, roles: [{ name: 'veterinarian' }], permissions: [] })),
  };
  const sessions = { create: vi.fn(async () => ({ refreshToken: 'refresh', expiresAt: new Date(NOW.getTime() + 12 * 60 * MINUTE) })) };
  const counters = new Map<string, number>();
  const redis = {
    pttl: vi.fn(async () => -2),
    incr: vi.fn(async (key: string) => { counters.set(key, (counters.get(key) ?? 0) + 1); return counters.get(key)!; }),
    pexpire: vi.fn(async () => 1),
    multi: vi.fn(() => ({ set: () => ({ del: () => ({ exec: async () => [] }) }) })),
  };
  const service = new AuthService(prisma as never, hasher as never, tokens as never, access as never, sessions as never, redis as never);
  return { service, prisma, stored, redis };
}

const login = (ctx: ReturnType<typeof build>, password: string, email = 'qa.bloqueo@vetmanage.test') =>
  ctx.service.login({ email, password });

describe('HU-57 Iniciar sesión (unitarias)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => vi.useRealTimers());

  it('CP-57-01 inicia sesión con credenciales correctas y entrega el token', async () => {
    const ctx = build();
    const session = await login(ctx, 'QaVet2026');
    expect(session.accessToken).toBe('jwt-de-prueba');
    expect(session.refreshToken).toBe('refresh');
    expect(ctx.stored!.failedLoginAttempts).toBe(0);
  });

  it('CP-57-03 niega el acceso con contraseña incorrecta sin revelar qué campo falló', async () => {
    const error = await rejection(login(build(), 'Mala123'));
    expect(error.statusCode).toBe(401);
    expect(error.message.startsWith('Correo o contraseña incorrectos')).toBe(true);
  });

  it('CP-57-03 responde igual para un correo no registrado', async () => {
    const error = await rejection(login(build(null), 'QaVet2026', 'noexiste@vetmanage.test'));
    expect(error.statusCode).toBe(401);
    expect(error.message.startsWith('Correo o contraseña incorrectos')).toBe(true);
  });

  it.each([
    ['sin correo', { email: '', password: 'QaVet2026' }],
    ['sin contraseña', { email: 'qa.bloqueo@vetmanage.test', password: '' }],
    ['contraseña solo espacios', { email: 'qa.bloqueo@vetmanage.test', password: '   ' }],
  ])('CP-57-04 no intenta el acceso %s', async (_, body) => {
    const ctx = build();
    const error = await rejection(ctx.service.login(body));
    expect(describeError(error)).toEqual({ status: 400, message: 'Ingrese su correo y contraseña' });
    expect(ctx.prisma.user.findFirst).not.toHaveBeenCalled();
  });

  it('CP-57-05 el 4.º intento fallido NO bloquea y avisa que queda 1 intento (valor límite)', async () => {
    const ctx = build({ failedLoginAttempts: 3 });
    const error = await rejection(login(ctx, 'Incorrecta1'));
    expect(error.statusCode).toBe(401);
    expect(error.message).toContain('Le queda 1 intento');
    expect(ctx.stored!.isLocked).toBe(false);
  });

  it('CP-57-05 el 5.º intento fallido bloquea la cuenta 15 minutos', async () => {
    const ctx = build({ failedLoginAttempts: 4 });
    const error = await rejection(login(ctx, 'Incorrecta1'));
    expect(describeError(error)).toEqual({ status: 423, message: 'Cuenta bloqueada temporalmente. Intente en 15 minutos' });
    expect(ctx.stored!.isLocked).toBe(true);
    expect(ctx.stored!.lockedAt).toEqual(NOW);
  });

  it('CP-57-06 durante el bloqueo (hace 5 min) niega incluso la contraseña correcta: "Intente en 10 minutos"', async () => {
    const ctx = build({ isLocked: true, lockedAt: new Date(NOW.getTime() - 5 * MINUTE) });
    const error = await rejection(login(ctx, 'QaVet2026'));
    expect(describeError(error)).toEqual({ status: 423, message: 'Cuenta bloqueada temporalmente. Intente en 10 minutos' });
  });

  it('CP-57-06 al cumplirse los 15 minutos el bloqueo se levanta (valor límite)', async () => {
    const ctx = build({ isLocked: true, lockedAt: new Date(NOW.getTime() - 15 * MINUTE) });
    const session = await login(ctx, 'QaVet2026');
    expect(session.accessToken).toBe('jwt-de-prueba');
    expect(ctx.stored!.isLocked).toBe(false);
  });

  it('CP-57-07 reinicia el contador tras un inicio de sesión correcto', async () => {
    const ctx = build({ failedLoginAttempts: 3 });
    await login(ctx, 'QaVet2026');
    expect(ctx.stored!.failedLoginAttempts).toBe(0);
  });

  it.each([['INACTIVE'], ['DEACTIVATED']])('CP-57-08 niega el acceso a una cuenta %s', async (status) => {
    const error = await rejection(login(build({ status }), 'QaVet2026'));
    expect(describeError(error)).toEqual({ status: 403, message: 'Su cuenta se encuentra desactivada. Contacte al administrador' });
  });

  it('CP-57-05 también bloquea al 5.º intento con un correo no registrado (no revela si existe)', async () => {
    const ctx = build(null);
    for (let i = 0; i < 4; i += 1) await rejection(login(ctx, 'x', 'fantasma@vetmanage.test'));
    const error = await rejection(login(ctx, 'x', 'fantasma@vetmanage.test'));
    expect(error.statusCode).toBe(423);
  });
});
