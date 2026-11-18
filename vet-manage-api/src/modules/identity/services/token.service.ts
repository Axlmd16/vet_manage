import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export type TokenPayload = { sub: string };

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  issue(userId: string): Promise<string> {
    return this.jwt.signAsync(
      { sub: userId } satisfies TokenPayload,
      { expiresIn: this.config.getOrThrow<string>('auth.jwtExpiresIn') as never },
    );
  }

  // Devuelve el identificador del usuario o null si el token es inválido o venció.
  async verify(token: string): Promise<string | null> {
    try {
      const payload = await this.jwt.verifyAsync<TokenPayload>(token);
      return typeof payload.sub === 'string' ? payload.sub : null;
    } catch {
      return null;
    }
  }
}
