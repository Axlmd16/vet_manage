import { Injectable, Logger } from '@nestjs/common';
import { isEmail } from 'class-validator';
import { createHash } from 'node:crypto';
import { ApiException } from '../../../common/errors/api-exception.js';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service.js';
import { RedisService } from '../../../infrastructure/redis/redis.service.js';
import type { LoginDto } from '../dtos/login.dto.js';
import type { AuthSession } from '../types/session-profile.js';
import { AccessService } from './access.service.js';
import { PasswordHasher } from './password-hasher.service.js';
import { SessionService, type SessionMeta } from './session.service.js';
import { TokenService } from './token.service.js';

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCK_MINUTES = 15;

const LOCK_MS = LOCK_MINUTES * 60_000;
const UNKNOWN_COUNTER_TTL_MS = 24 * 60 * 60_000;

export const LOGIN_MESSAGES = {
  missing: 'Ingrese su correo y contraseña',
  invalidEmail: 'Ingrese un correo electrónico válido',
  invalid: 'Correo o contraseña incorrectos',
  disabled: 'Su cuenta se encuentra desactivada. Contacte al administrador',
  sessionExpired: 'La sesión expiró. Inicie sesión nuevamente',
} as const;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  // Hash usado cuando el correo no existe, para que la respuesta tarde lo mismo.
  private dummyHash?: Promise<string>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
    private readonly access: AccessService,
    private readonly sessions: SessionService,
    private readonly redis: RedisService,
  ) {}

  async login(input: LoginDto, meta: SessionMeta = {}): Promise<AuthSession> {
    const email = input.email?.trim().toLowerCase() ?? '';
    const password = input.password ?? '';
    if (!email || !password.trim()) {
      throw new ApiException(LOGIN_MESSAGES.missing, 400, [], 'LOGIN_MISSING_CREDENTIALS');
    }
    if (!isEmail(email)) {
      throw new ApiException(LOGIN_MESSAGES.invalidEmail, 400, [], 'LOGIN_INVALID_EMAIL');
    }

    const user = await this.prisma.user.findFirst({
      where: { person: { email: { equals: email, mode: 'insensitive' } } },
      select: { id: true, password: true, status: true, isLocked: true, lockedAt: true },
    });

    if (!user?.password) {
      this.dummyHash ??= this.hasher.hash('cuenta-inexistente');
      await this.hasher.verify(password, await this.dummyHash);
      return this.registerUnknownFailure(email);
    }

    const now = Date.now();
    if (user.isLocked) {
      const remaining = (user.lockedAt?.getTime() ?? 0) + LOCK_MS - now;
      if (remaining > 0) throw accountLocked(Math.ceil(remaining / 60_000));

      await this.prisma.user.update({
        where: { id: user.id },
        data: { isLocked: false, lockedAt: null, failedLoginAttempts: 0 },
      });
    }

    if (!(await this.hasher.verify(password, user.password))) {
      return this.registerFailure(user.id, new Date(now));
    }

    if (user.status !== 'ACTIVE') {
      throw new ApiException(LOGIN_MESSAGES.disabled, 403, [], 'LOGIN_ACCOUNT_DISABLED');
    }

    await this.prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0 } });
    return this.openSession(user.id, () => this.sessions.create(user.id, meta));
  }

  // Cambia un refresh token vigente por uno nuevo y un token de acceso.
  async refresh(refreshToken: string | undefined, meta: SessionMeta = {}): Promise<AuthSession> {
    const rotated = refreshToken ? await this.sessions.rotate(refreshToken, meta) : null;
    if (!rotated) throw sessionExpired();
    return this.openSession(rotated.userId, () => Promise.resolve(rotated));
  }

  logout(refreshToken: string | undefined) {
    return refreshToken ? this.sessions.revoke(refreshToken) : Promise.resolve();
  }

  private async openSession(
    userId: string,
    issue: () => Promise<{ refreshToken: string; expiresAt: Date }>,
  ): Promise<AuthSession> {
    const profile = await this.access.getSessionProfile(userId);
    if (!profile) throw sessionExpired();

    const session = await issue();
    return {
      accessToken: await this.tokens.issue(userId),
      refreshToken: session.refreshToken,
      refreshExpiresAt: session.expiresAt,
      ...profile,
    };
  }

  // Suma un intento fallido y bloquea la cuenta al llegar al máximo.
  private async registerFailure(userId: string, now: Date): Promise<never> {
    const { failedLoginAttempts } = await this.prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: { increment: 1 } },
      select: { failedLoginAttempts: true },
    });
    if (failedLoginAttempts < MAX_FAILED_ATTEMPTS) {
      throw invalidCredentials(MAX_FAILED_ATTEMPTS - failedLoginAttempts);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isLocked: true, lockedAt: now, failedLoginAttempts: 0 },
    });
    throw accountLocked(LOCK_MINUTES);
  }

  // Para un correo no registrado se simulan intentos y bloqueo, así la respuesta no revela si existe.
  private async registerUnknownFailure(email: string): Promise<never> {
    const key = `auth:login-unknown:${createHash('sha256').update(email).digest('hex')}`;
    let attempts: number;
    try {
      const lockMs = await this.redis.pttl(`${key}:lock`);
      if (lockMs > 0) throw accountLocked(Math.ceil(lockMs / 60_000));

      attempts = await this.redis.incr(key);
      await this.redis.pexpire(key, UNKNOWN_COUNTER_TTL_MS);
      if (attempts >= MAX_FAILED_ATTEMPTS) {
        await this.redis.multi().set(`${key}:lock`, '1', 'PX', LOCK_MS).del(key).exec();
        throw accountLocked(LOCK_MINUTES);
      }
    } catch (error) {
      if (error instanceof ApiException) throw error;
      this.logger.warn(`No se pudo registrar el intento en Redis: ${String(error)}`);
      throw invalidCredentials();
    }
    throw invalidCredentials(MAX_FAILED_ATTEMPTS - attempts);
  }
}

export function invalidCredentialsMessage(remaining?: number) {
  if (remaining === undefined) return LOGIN_MESSAGES.invalid;
  const left = remaining === 1 ? 'Le queda 1 intento' : `Le quedan ${remaining} intentos`;
  return `${LOGIN_MESSAGES.invalid}. ${left} antes de que la cuenta se bloquee`;
}

function invalidCredentials(remaining?: number) {
  return new ApiException(invalidCredentialsMessage(remaining), 401, [], 'LOGIN_INVALID_CREDENTIALS');
}

export function lockedMessage(minutes: number) {
  return `Cuenta bloqueada temporalmente. Intente en ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
}

function accountLocked(minutes: number) {
  return new ApiException(lockedMessage(minutes), 423, [], 'LOGIN_ACCOUNT_LOCKED');
}

function sessionExpired() {
  return new ApiException(LOGIN_MESSAGES.sessionExpired, 401, [], 'SESSION_EXPIRED');
}
