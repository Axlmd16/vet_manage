import { ApiException } from '../../../common/errors/api-exception.js';
import type { PrismaService } from '../../../infrastructure/database/prisma/prisma.service.js';
import type { AccessService } from './access.service.js';
import { AuthService, LOGIN_MESSAGES, lockedMessage } from './auth.service.js';
import { PasswordHasher } from './password-hasher.service.js';
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

describe('AuthService', () => {
  const hasher = new PasswordHasher();
  let passwordHash: string;
  let user: StoredUser | null;
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

  beforeAll(async () => {
    passwordHash = await hasher.hash('Vet12345');
  });

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
    vi.clearAllMocks();
    user = { id: 'u1', password: passwordHash, status: 'ACTIVE', isLocked: false, lockedAt: null, failedLoginAttempts: 0 };
    service = new AuthService(
      prisma as unknown as PrismaService,
      hasher,
      tokens as unknown as TokenService,
      access as unknown as AccessService,
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

  it('inicia sesión con credenciales correctas', async () => {
    const result = await service.login({ email: 'ana@vet.test', password: 'Vet12345' });

    expect(result.accessToken).toBe('token');
    expect(result.user.email).toBe('ana@vet.test');
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

  it('responde lo mismo con contraseña incorrecta y con correo no registrado', async () => {
    const wrongPassword = await loginError('ana@vet.test', 'Otra1234');
    user = null;
    const unknownEmail = await loginError('nadie@vet.test', 'Vet12345');

    expect(wrongPassword.statusCode).toBe(401);
    expect(wrongPassword.message).toBe(LOGIN_MESSAGES.invalid);
    expect(unknownEmail.statusCode).toBe(401);
    expect(unknownEmail.message).toBe(LOGIN_MESSAGES.invalid);
  });

  it('rechaza una cuenta sin contraseña como credenciales incorrectas', async () => {
    user!.password = null;

    expect((await loginError('ana@vet.test', 'Vet12345')).message).toBe(LOGIN_MESSAGES.invalid);
  });

  it('cuenta los intentos fallidos', async () => {
    await loginError('ana@vet.test', 'Otra1234');
    await loginError('ana@vet.test', 'Otra1234');

    expect(user!.failedLoginAttempts).toBe(2);
    expect(user!.isLocked).toBe(false);
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
  });

  it('no revela el estado de la cuenta si la contraseña es incorrecta', async () => {
    user!.status = 'INACTIVE';

    expect((await loginError('ana@vet.test', 'Otra1234')).message).toBe(LOGIN_MESSAGES.invalid);
  });
});
