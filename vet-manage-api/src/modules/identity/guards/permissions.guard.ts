import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiException } from '../../../common/errors/api-exception.js';
import { PERMISSIONS_METADATA } from '../decorators/require-permissions.decorator.js';
import { AccessService } from '../services/access.service.js';
import type { AuthenticatedRequest } from '../types/authenticated-request.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly access: AccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[] | undefined>(PERMISSIONS_METADATA, [
      context.getHandler(),
      context.getClass(),
    ]) ?? [];
    if (required.length === 0) return true;

    const user = context.switchToHttp().getRequest<AuthenticatedRequest>().user;
    if (!user) throw ApiException.unauthorized();

    const granted = await this.access.getPermissionKeys(user.id);
    if (!required.every((key) => granted.has(key))) throw ApiException.forbidden();

    return true;
  }
}
