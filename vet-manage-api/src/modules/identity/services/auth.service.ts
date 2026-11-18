import { Injectable } from '@nestjs/common';
import { ApiException } from '../../../common/errors/api-exception.js';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service.js';
import type { LoginDto } from '../dtos/login.dto.js';
import type { LoginResult } from '../types/session-profile.js';
import { AccessService } from './access.service.js';
import { PasswordHasher } from './password-hasher.service.js';
import { TokenService } from './token.service.js';

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCK_MINUTES = 15;

const LOCK_MS = LOCK_MINUTES * 60_000;

export const LOGIN_MESSAGES = {
  missing: 'Ingrese su correo y contraseña',
  invalid: 'Correo o contraseña incorrectos',
  disabled: 'Su cuenta se encuentra desactivada. Contacte al administrador',
} as const;

@Injectable()
export class AuthService {
  // Hash usado cuando el correo no existe, para que la respuesta tarde lo mismo.
  private dummyHash?: Promise<string>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
    private readonly access: AccessService,
  ) {}

  async login(input: LoginDto): Promise<LoginResult> {
    const email = input.email?.trim().toLowerCase() ?? '';
    const password = input.password ?? '';
    if (!email || !password.trim()) {
      throw new ApiException(LOGIN_MESSAGES.missing, 400, [], 'LOGIN_MISSING_CREDENTIALS');
    }

    const user = await this.prisma.user.findFirst({
      where: { person: { email: { equals: email, mode: 'insensitive' } } },
      select: { id: true, password: true, status: true, isLocked: true, lockedAt: true },
    });

    if (!user?.password) {
      this.dummyHash ??= this.hasher.hash('cuenta-inexistente');
      await this.hasher.verify(password, await this.dummyHash);
      throw invalidCredentials();
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
      await this.registerFailure(user.id, new Date(now));
      throw invalidCredentials();
    }

    if (user.status !== 'ACTIVE') {
      throw new ApiException(LOGIN_MESSAGES.disabled, 403, [], 'LOGIN_ACCOUNT_DISABLED');
    }

    await this.prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0 } });

    const profile = await this.access.getSessionProfile(user.id);
    if (!profile) throw invalidCredentials();

    return { accessToken: await this.tokens.issue(user.id), ...profile };
  }

  // Suma un intento fallido y bloquea la cuenta al llegar al máximo.
  private async registerFailure(userId: string, now: Date) {
    const { failedLoginAttempts } = await this.prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: { increment: 1 } },
      select: { failedLoginAttempts: true },
    });
    if (failedLoginAttempts < MAX_FAILED_ATTEMPTS) return;

    await this.prisma.user.update({
      where: { id: userId },
      data: { isLocked: true, lockedAt: now, failedLoginAttempts: 0 },
    });
    throw accountLocked(LOCK_MINUTES);
  }
}

function invalidCredentials() {
  return new ApiException(LOGIN_MESSAGES.invalid, 401, [], 'LOGIN_INVALID_CREDENTIALS');
}

export function lockedMessage(minutes: number) {
  return `Cuenta bloqueada temporalmente. Intente en ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
}

function accountLocked(minutes: number) {
  return new ApiException(lockedMessage(minutes), 423, [], 'LOGIN_ACCOUNT_LOCKED');
}
