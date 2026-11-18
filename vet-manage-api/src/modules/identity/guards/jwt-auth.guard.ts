import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ApiException } from '../../../common/errors/api-exception.js';
import { AccessService } from '../services/access.service.js';
import { TokenService } from '../services/token.service.js';
import type { AuthenticatedRequest } from '../types/authenticated-request.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly tokens: TokenService,
    private readonly access: AccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token) throw ApiException.unauthorized();

    const userId = await this.tokens.verify(token);
    if (!userId) throw ApiException.unauthorized('Sesión inválida o vencida');

    const user = await this.access.findActiveUser(userId);
    if (!user) throw ApiException.unauthorized('Cuenta inexistente o inactiva');

    request.user = user;
    return true;
  }
}
