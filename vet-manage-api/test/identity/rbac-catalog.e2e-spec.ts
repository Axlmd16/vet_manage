import { ConfigService } from '@nestjs/config';
import { PERMISSIONS } from '../../src/config/permissions.catalog.js';
import { ROLES } from '../../src/config/roles.catalog.js';
import { PrismaService } from '../../src/infrastructure/database/prisma/prisma.service.js';
import { RbacCatalogSynchronizer } from '../../src/modules/identity/services/rbac-catalog-synchronizer.service.js';
import { clearRbac, inRollback, type Tx } from './support.js';

describe('Sincronización del catálogo RBAC (e2e)', () => {
  const prisma = new PrismaService();
  const synchronizer = new RbacCatalogSynchronizer(prisma, { get: () => 'create-only' } as unknown as ConfigService);
  const run = (fn: (tx: Tx) => Promise<void>) => inRollback(prisma, fn);

  const grantKeys = async (tx: Tx, roleName: string) => {
    const grants = await tx.rolePermission.findMany({
      where: { role: { name: roleName } },
      include: { permission: true },
    });
    return new Set(grants.map((grant) => `${grant.permission.module}:${grant.permission.action}`));
  };

  beforeAll(() => prisma.$connect());
  afterAll(() => prisma.$disconnect());

  it('crea los 8 roles, los permisos y las asignaciones en una base vacía', () =>
    run(async (tx) => {
      await clearRbac(tx);
      const result = await synchronizer.synchronizeWith(tx);

      const expectedGrants = ROLES.reduce((total, role) => total + new Set(role.permissions).size, 0);
      expect(result.permissionsCreated).toBe(PERMISSIONS.length);
      expect(result.rolesCreated).toBe(8);
      expect(result.grantsCreated).toBe(expectedGrants);
      expect(await tx.role.count({ where: { isSystem: true, isActive: true } })).toBe(8);
      expect(await grantKeys(tx, 'administrator')).toEqual(
        new Set(ROLES.find((role) => role.name === 'administrator')?.permissions),
      );
      expect(await grantKeys(tx, 'client')).toEqual(new Set());
    }));

  it('una segunda ejecución no crea ni cambia nada', () =>
    run(async (tx) => {
      await clearRbac(tx);
      await synchronizer.synchronizeWith(tx);

      expect(await synchronizer.synchronizeWith(tx)).toEqual({
        permissionsCreated: 0,
        permissionsReactivated: 0,
        permissionsDeactivated: 0,
        rolesCreated: 0,
        grantsCreated: 0,
        grantsRevoked: 0,
      });
    }));

  it('conserva los cambios hechos por el Administrador al reiniciar', () =>
    run(async (tx) => {
      await clearRbac(tx);
      await synchronizer.synchronizeWith(tx);

      const permission = (key: string) => {
        const [module, action] = key.split(':');
        return tx.permission.findFirstOrThrow({ where: { module, action } });
      };
      const cashier = await tx.role.findUniqueOrThrow({ where: { name: 'cashier' } });
      const receptionist = await tx.role.findUniqueOrThrow({ where: { name: 'receptionist' } });
      await tx.rolePermission.create({
        data: { roleId: cashier.id, permissionId: (await permission('clients:read')).id },
      });
      await tx.rolePermission.delete({
        where: {
          roleId_permissionId: { roleId: receptionist.id, permissionId: (await permission('clients:create')).id },
        },
      });
      await tx.role.update({ where: { name: 'veterinarian' }, data: { isActive: false, displayName: 'Médico' } });

      await synchronizer.synchronizeWith(tx);

      expect((await grantKeys(tx, 'cashier')).has('clients:read')).toBe(true);
      expect((await grantKeys(tx, 'receptionist')).has('clients:create')).toBe(false);
      const veterinarian = await tx.role.findUniqueOrThrow({ where: { name: 'veterinarian' } });
      expect(veterinarian.isActive).toBe(false);
      expect(veterinarian.displayName).toBe('Médico');
    }));

  it('un permiso nuevo del catálogo llega a los roles que lo declaran sin restaurar lo quitado', () =>
    run(async (tx) => {
      await clearRbac(tx);
      await synchronizer.synchronizeWith(tx);

      const receptionist = await tx.role.findUniqueOrThrow({ where: { name: 'receptionist' } });
      await tx.rolePermission.deleteMany({
        where: { roleId: receptionist.id, permission: { module: 'pets', action: 'read' } },
      });
      await tx.permission.deleteMany({ where: { module: 'clients', action: 'activate' } });

      const result = await synchronizer.synchronizeWith(tx);

      expect(result.permissionsCreated).toBe(1);
      expect((await grantKeys(tx, 'receptionist')).has('clients:activate')).toBe(true);
      expect((await grantKeys(tx, 'manager')).has('clients:activate')).toBe(true);
      expect((await grantKeys(tx, 'receptionist')).has('pets:read')).toBe(false);
    }));

  it('desactiva los permisos retirados del catálogo y reactiva los declarados de nuevo', () =>
    run(async (tx) => {
      await clearRbac(tx);
      await synchronizer.synchronizeWith(tx);
      await tx.permission.create({ data: { module: 'legacy', action: 'old', displayName: 'Antiguo' } });
      await tx.permission.updateMany({ where: { module: 'users', action: 'read' }, data: { isActive: false } });

      const result = await synchronizer.synchronizeWith(tx);

      const legacy = await tx.permission.findFirstOrThrow({ where: { module: 'legacy', action: 'old' } });
      const usersRead = await tx.permission.findFirstOrThrow({ where: { module: 'users', action: 'read' } });
      expect(legacy.isActive).toBe(false);
      expect(usersRead.isActive).toBe(true);
      expect(result.permissionsDeactivated).toBe(1);
      expect(result.permissionsReactivated).toBe(1);
    }));

  describe('modo strict', () => {
    it('repone asignaciones y roles según el catálogo', () =>
      run(async (tx) => {
        await clearRbac(tx);
        await synchronizer.synchronizeWith(tx);
        const receptionist = await tx.role.findUniqueOrThrow({ where: { name: 'receptionist' } });
        const extra = await tx.permission.findFirstOrThrow({ where: { module: 'users', action: 'read' } });
        await tx.rolePermission.create({ data: { roleId: receptionist.id, permissionId: extra.id } });
        await tx.rolePermission.deleteMany({
          where: { roleId: receptionist.id, permission: { module: 'clients', action: 'create' } },
        });
        await tx.role.update({ where: { name: 'veterinarian' }, data: { isActive: false, displayName: 'Médico' } });

        const result = await synchronizer.synchronizeWith(tx, 'strict');

        const keys = await grantKeys(tx, 'receptionist');
        expect(keys.has('users:read')).toBe(false);
        expect(keys.has('clients:create')).toBe(true);
        expect(result.grantsRevoked).toBe(1);
        const veterinarian = await tx.role.findUniqueOrThrow({ where: { name: 'veterinarian' } });
        expect(veterinarian.isActive).toBe(true);
        expect(veterinarian.displayName).toBe('Veterinario');
      }));

    it('no cambia nada en una segunda ejecución y no toca roles personalizados', () =>
      run(async (tx) => {
        await clearRbac(tx);
        await synchronizer.synchronizeWith(tx, 'strict');
        const custom = await tx.role.create({ data: { name: 'personalizado', displayName: 'Personalizado' } });
        const permission = await tx.permission.findFirstOrThrow({ where: { module: 'users', action: 'read' } });
        await tx.rolePermission.create({ data: { roleId: custom.id, permissionId: permission.id } });

        const result = await synchronizer.synchronizeWith(tx, 'strict');

        expect(result).toMatchObject({ rolesCreated: 0, grantsCreated: 0, grantsRevoked: 0 });
        expect(await grantKeys(tx, 'personalizado')).toEqual(new Set(['users:read']));
      }));
  });
});
