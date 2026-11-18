import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import type { PermissionKey } from '../../../config/permissions.catalog.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../guards/permissions.guard.js';

export const PERMISSIONS_METADATA = 'identity:required-permissions';

// Exige sesión válida y todos los permisos indicados. El módulo que lo usa debe importar IdentityModule.
export const RequirePermissions = (...permissions: PermissionKey[]) =>
  applyDecorators(
    SetMetadata(PERMISSIONS_METADATA, permissions),
    UseGuards(JwtAuthGuard, PermissionsGuard),
  );

// Exige solo una sesión válida, sin permisos específicos.
export const Authenticated = () => UseGuards(JwtAuthGuard);
