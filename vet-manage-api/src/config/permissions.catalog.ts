import { IDENTITY_PERMISSIONS } from './permissions/identity.permissions.js';
import { INVENTORY_PERMISSIONS } from './permissions/inventory.permissions.js';
import { CLINICAL_PERMISSIONS } from './permissions/clinical.permissions.js';
import { SUPPLIERS_PERMISSIONS } from './permissions/suppliers.permissions.js';

export type PermissionKey = `${string}:${string}`;
export type PermissionDefinition = {
  key: PermissionKey;
  displayName: string;
  description: string;
  visible?: boolean;
};

export const PERMISSION_CATALOGS = [
  IDENTITY_PERMISSIONS,
  CLINICAL_PERMISSIONS,
  INVENTORY_PERMISSIONS,
  SUPPLIERS_PERMISSIONS,
] as const;

export const PERMISSIONS = PERMISSION_CATALOGS.flat();
