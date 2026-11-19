import type { PermissionDefinition } from '../permissions.catalog.js';

const define = (entries: readonly [PermissionDefinition['key'], string][]): readonly PermissionDefinition[] => entries.map(([key, displayName]) => ({ key, displayName, description: `Permite: ${displayName.toLowerCase()}`, visible: true }));

export const IDENTITY_PERMISSIONS = define([
  ['users:create', 'Registrar usuarios'],
  ['users:read', 'Consultar usuarios'],
  ['users:update', 'Actualizar datos de usuario'],
  ['users:assign-roles', 'Asignar y quitar roles'],
  ['users:change-status', 'Activar e inactivar cuentas'],
  ['users:deactivate', 'Dar de baja usuarios'],
  ['roles:manage-permissions', 'Gestionar permisos por rol'],
  ['audit:read', 'Consultar auditoría'],
  ['audit:export', 'Exportar auditoría'],
]);
