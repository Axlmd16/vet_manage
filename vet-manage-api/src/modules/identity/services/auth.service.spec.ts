import { ApiException } from '../../../common/errors/api-exception.js';
import type { PrismaService } from '../../../infrastructure/database/prisma/prisma.service.js';
import type { RedisService } from '../../../infrastructure/redis/redis.service.js';
import type { AccessService } from './access.service.js';
import { AuthService, LOGIN_MESSAGES, invalidCredentialsMessage, lockedMessage } from './auth.service.js';
import { PasswordHasher } from './password-hasher.service.js';
import type { SessionService } from './session.service.js';
import type { TokenService } from './token.service.js';

type StoredUser = {
  id: string;
  password: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'DEACTIVATED';
  isLocked: boolean;
  lockedAt: Date | null;
  failedLoginAttempts: number;
};

const NOW = new Date('2026-11-18T10:00:00Z');
const minutesAgo = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000);

// Redis en memoria con los comandos que usa el servicio; las expiraciones se leen del reloj falso.
function createFakeRedis() {
  const values = new Map<string, { value: string; expiresAt?: number }>();
  const alive = (key: string) => {
    const entry = values.get(key);
    if (entry?.expiresAt !== undefined && entry.expiresAt <= Date.now()) values.delete(key);
    return values.get(key);
  };
  const redis = {
    available: true,
    pttl: vi.fn(async (key: string) => {
      if (!redis.available) throw new Error('Redis caído');
      const entry = alive(key);
      return entry ? (entry.expiresAt ?? 0) - Date.now() : -2;
    }),
    incr: vi.fn(async (key: string) => {
      const next = Number(alive(key)?.value ?? 0) + 1;
      values.set(key, { ...values.get(key), value: String(next) });
      return next;
    }),
    pexpire: vi.fn(async (key: string, ms: number) => {
      const entry = alive(key);
      if (entry) entry.expiresAt = Date.now() + ms;
    }),
    multi: vi.fn(() => {
      const chain = {
        set: (key: string, value: string, _mode: string, ms: number) => {
          values.set(key, { value, expiresAt: Date.now() + ms });
          return chain;
        },
        del: (key: string) => {
          values.delete(key);
          return chain;
        },
        exec: async () => [],
      };
      return chain;
    }),
  };
  return redis;
}

describe('AuthService', () => {
  const hasher = new PasswordHasher();
  let passwordHash: string;
  let user: StoredUser | null;
  let redis: ReturnType<typeof createFakeRedis>;
  let service: AuthService;

  // Base de datos en memoria con un solo usuario.
  const prisma = {
    user: {
      findFirst: vi.fn(async () => user && { ...user }),
      update: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        if (!user) throw new Error('sin usuario');
        for (const [key, value] of Object.entries(data)) {
          if (value && typeof value === 'object' && 'increment' in value) {
            user.failedLoginAttempts += (value as { increment: number }).increment;
          } else {
            Object.assign(user, { [key]: value });
          }
        }
        return { ...user };
      }),
    },
  };

  const profile = {
    mustChangePassword: false,
    user: { id: 'u1', firstName: 'Ana', lastName: 'Ríos', email: 'ana@vet.test', roles: [], permissions: [] },
  };
  const access = { getSessionProfile: vi.fn(async () => profile) };
  const tokens = { issue: vi.fn(async () => 'token') };
  const sessions = {
    create: vi.fn(async () => ({ refreshToken: 'refresh', expiresAt: NOW })),
    rotate: vi.fn(async (): Promise<{ userId: string; refreshToken: string; expiresAt: Date } | null> => null),
    revoke: vi.fn(async () => undefined),
  };

  beforeAll(async () => {
    passwordHash = await hasher.hash('Vet12345');
  });

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
    vi.clearAllMocks();
    user = { id: 'u1', password: passwordHash, status: 'ACTIVE', isLocked: false, lockedAt: null, failedLoginAttempts: 0 };
    redis = createFakeRedis();
    service = new AuthService(
      prisma as unknown as PrismaService,
      hasher,
      tokens as unknown as TokenService,
      access as unknown as AccessService,
      sessions as unknown as SessionService,
      redis as unknown as RedisService,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function loginError(email: string | undefined, password: string | undefined) {
    const error = await service.login({ email, password }).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiException);
    return error as ApiException;
  }

  it('inicia sesión y abre una sesión renovable', async () => {
    const result = await service.login({ email: 'ana@vet.test', password: 'Vet12345' }, { ipAddress: '10.0.0.1' });

    expect(result).toMatchObject({ accessToken: 'token', refreshToken: 'refresh', user: { email: 'ana@vet.test' } });
    expect(sessions.create).toHaveBeenCalledWith('u1', { ipAddress: '10.0.0.1' });
  });

  it('normaliza el correo antes de buscarlo', async () => {
    await service.login({ email: '  ANA@Vet.Test ', password: 'Vet12345' });

    expect(prisma.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { person: { email: { equals: 'ana@vet.test', mode: 'insensitive' } } } }),
    );
  });

  it.each([
    [undefined, 'Vet12345'],
    ['ana@vet.test', undefined],
    ['  ', 'Vet12345'],
    ['ana@vet.test', '   '],
  ])('rechaza campos vacíos (%s, %s) sin consultar la cuenta', async (email, password) => {
    const error = await loginError(email, password);

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe(LOGIN_MESSAGES.missing);
    expect(prisma.user.findFirst).not.toHaveBeenCalled();
  });

  it.each(['ana', 'ana@', 'ana@vet', 'ana vet@vet.test'])('rechaza el correo con formato inválido %s', async (email) => {
    const error = await loginError(email, 'Vet12345');

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe(LOGIN_MESSAGES.invalidEmail);
    expect(prisma.user.findFirst).not.toHaveBeenCalled();
  });

  it('avisa cuántos intentos quedan antes del bloqueo', async () => {
    const first = await loginError('ana@vet.test', 'Otra1234');
    const second = await loginError('ana@vet.test', 'Otra1234');
    user!.failedLoginAttempts = 3;
    const fourth = await loginError('ana@vet.test', 'Otra1234');

    expect(first.statusCode).toBe(401);
    expect(first.message).toBe('Correo o contraseña incorrectos. Le quedan 4 intentos antes de que la cuenta se bloquee');
    expect(second.message).toBe(invalidCredentialsMessage(3));
    expect(fourth.message).toBe('Correo o contraseña incorrectos. Le queda 1 intento antes de que la cuenta se bloquee');
  });

  it('responde igual a un correo no registrado, con intentos y bloqueo simulados', async () => {
    const known = await loginError('ana@vet.test', 'Otra1234');
    user = null;
    const unknown = await loginError('nadie@vet.test', 'Vet12345');

    expect(unknown.statusCode).toBe(401);
    expect(unknown.message).toBe(known.message);

    for (let i = 0; i < 3; i++) await loginError('nadie@vet.test', 'Vet12345');
    const fifth = await loginError('nadie@vet.test', 'Vet12345');
    expect(fifth.statusCode).toBe(423);
    expect(fifth.message).toBe(lockedMessage(15));

    vi.setSystemTime(new Date(NOW.getTime() + 5 * 60_000));
    expect((await loginError('nadie@vet.test', 'Vet12345')).message).toBe(lockedMessage(10));
  });

  it('responde sin contador si Redis no está disponible', async () => {
    user = null;
    redis.available = false;

    expect((await loginError('nadie@vet.test', 'Vet12345')).message).toBe(LOGIN_MESSAGES.invalid);
  });

  it('rechaza una cuenta sin contraseña como credenciales incorrectas', async () => {
    user!.password = null;

    expect((await loginError('ana@vet.test', 'Vet12345')).statusCode).toBe(401);
  });

  it('bloquea la cuenta 15 minutos al quinto intento fallido', async () => {
    user!.failedLoginAttempts = 4;

    const error = await loginError('ana@vet.test', 'Otra1234');

    expect(error.statusCode).toBe(423);
    expect(error.message).toBe('Cuenta bloqueada temporalmente. Intente en 15 minutos');
    expect(user).toMatchObject({ isLocked: true, lockedAt: NOW, failedLoginAttempts: 0 });
  });

  it('niega el acceso durante el bloqueo aunque la contraseña sea correcta', async () => {
    Object.assign(user!, { isLocked: true, lockedAt: minutesAgo(5) });

    const error = await loginError('ana@vet.test', 'Vet12345');

    expect(error.statusCode).toBe(423);
    expect(error.message).toBe('Cuenta bloqueada temporalmente. Intente en 10 minutos');
    expect(user!.lockedAt).toEqual(minutesAgo(5));
    expect(tokens.issue).not.toHaveBeenCalled();
  });

  it('redondea hacia arriba los minutos restantes', async () => {
    Object.assign(user!, { isLocked: true, lockedAt: new Date(minutesAgo(14).getTime() - 30_000) });

    expect((await loginError('ana@vet.test', 'Vet12345')).message).toBe(lockedMessage(1));
    expect(lockedMessage(1)).toBe('Cuenta bloqueada temporalmente. Intente en 1 minuto');
  });

  it('permite el acceso cuando el bloqueo venció', async () => {
    Object.assign(user!, { isLocked: true, lockedAt: minutesAgo(16), failedLoginAttempts: 0 });

    await expect(service.login({ email: 'ana@vet.test', password: 'Vet12345' })).resolves.toBeDefined();
    expect(user).toMatchObject({ isLocked: false, lockedAt: null });
  });

  it('reinicia el contador al iniciar sesión correctamente', async () => {
    user!.failedLoginAttempts = 3;

    await service.login({ email: 'ana@vet.test', password: 'Vet12345' });

    expect(user!.failedLoginAttempts).toBe(0);
  });

  it.each(['INACTIVE', 'DEACTIVATED'] as const)('niega el acceso a una cuenta %s con credenciales correctas', async (status) => {
    user!.status = status;

    const error = await loginError('ana@vet.test', 'Vet12345');

    expect(error.statusCode).toBe(403);
    expect(error.message).toBe(LOGIN_MESSAGES.disabled);
    expect(sessions.create).not.toHaveBeenCalled();
  });

  it('no revela el estado de la cuenta si la contraseña es incorrecta', async () => {
    user!.status = 'INACTIVE';

    expect((await loginError('ana@vet.test', 'Otra1234')).statusCode).toBe(401);
  });

  it('renueva la sesión con un refresh token vigente', async () => {
    sessions.rotate.mockResolvedValueOnce({ userId: 'u1', refreshToken: 'nuevo', expiresAt: NOW });

    const result = await service.refresh('anterior');

    expect(result).toMatchObject({ accessToken: 'token', refreshToken: 'nuevo', user: { id: 'u1' } });
  });

  it('rechaza la renovación sin token o con un token inválido', async () => {
    await expect(service.refresh(undefined)).rejects.toMatchObject({ statusCode: 401, message: LOGIN_MESSAGES.sessionExpired });
    await expect(service.refresh('usado')).rejects.toMatchObject({ statusCode: 401 });
  });
});
