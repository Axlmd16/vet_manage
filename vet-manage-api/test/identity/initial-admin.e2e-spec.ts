import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../src/infrastructure/database/prisma/prisma.service.js';
import { InitialAdminService } from '../../src/modules/identity/services/initial-admin.service.js';
import { PasswordHasher } from '../../src/modules/identity/services/password-hasher.service.js';
import { RbacCatalogSynchronizer } from '../../src/modules/identity/services/rbac-catalog-synchronizer.service.js';
import { clearRbac, inRollback, type Tx } from './support.js';

describe('Administrador inicial (e2e)', () => {
  const prisma = new PrismaService();
  const hasher = new PasswordHasher();
  const adminConfig = {
    email: 'admin.prueba@vetmanage.test',
    password: 'Admin12345',
    identification: '1799999990',
    firstName: 'Admin',
    lastName: 'Prueba',
  };
  const config = { getOrThrow: () => adminConfig } as unknown as ConfigService;
  const service = new InitialAdminService(prisma, config, hasher);
  const synchronizer = new RbacCatalogSynchronizer(prisma, { get: () => 'create-only' } as unknown as ConfigService);

  // Base sin roles asignados y sin el administrador de prueba.
  const prepare = async (tx: Tx) => {
    await clearRbac(tx);
    await synchronizer.synchronizeWith(tx);
    await tx.user.deleteMany({ where: { person: { identification: adminConfig.identification } } });
    await tx.person.deleteMany({ where: { identification: adminConfig.identification } });
  };
  const run = (fn: (tx: Tx) => Promise<void>) => inRollback(prisma, fn);

  beforeAll(() => prisma.$connect());
  afterAll(() => prisma.$disconnect());

  it('crea persona, usuario activo y rol Administrador con contraseña verificable', () =>
    run(async (tx) => {
      await prepare(tx);

      expect(await service.ensureWith(tx)).toBe(true);

      const user = await tx.user.findFirstOrThrow({
        where: { person: { identification: adminConfig.identification } },
        include: { person: true, userRoles: { include: { role: true } } },
      });
      expect(user.status).toBe('ACTIVE');
      expect(user.person.email).toBe(adminConfig.email);
      expect(user.userRoles.map((assignment) => assignment.role.name)).toEqual(['administrator']);
      expect(await hasher.verify(adminConfig.password, user.password ?? '')).toBe(true);
      expect(await hasher.verify('Otra12345', user.password ?? '')).toBe(false);
    }));

  it('no duplica nada al repetirse', () =>
    run(async (tx) => {
      await prepare(tx);
      await service.ensureWith(tx);

      expect(await service.ensureWith(tx)).toBe(false);
      expect(await tx.person.count({ where: { identification: adminConfig.identification } })).toBe(1);
    }));

  it('no crea nada si otro usuario ya es Administrador', () =>
    run(async (tx) => {
      await prepare(tx);
      const person = await tx.person.create({
        data: { identification: '1799999991', firstName: 'Otro', lastName: 'Admin', email: 'otro.admin@vetmanage.test' },
      });
      const user = await tx.user.create({ data: { personId: person.id } });
      const role = await tx.role.findUniqueOrThrow({ where: { name: 'administrator' } });
      await tx.userRole.create({ data: { userId: user.id, roleId: role.id } });

      expect(await service.ensureWith(tx)).toBe(false);
      expect(await tx.person.count({ where: { identification: adminConfig.identification } })).toBe(0);
    }));

  it('reutiliza a la persona registrada sin cuenta', () =>
    run(async (tx) => {
      await prepare(tx);
      const person = await tx.person.create({
        data: {
          identification: adminConfig.identification,
          firstName: 'Ana',
          lastName: 'Ruiz',
          email: 'ana.ruiz@vetmanage.test',
        },
      });

      expect(await service.ensureWith(tx)).toBe(true);

      expect(await tx.person.count({ where: { identification: adminConfig.identification } })).toBe(1);
      expect(await tx.user.count({ where: { personId: person.id } })).toBe(1);
    }));
});
