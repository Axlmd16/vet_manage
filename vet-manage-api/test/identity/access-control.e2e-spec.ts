import { Controller, Get, INestApplication, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { GlobalExceptionFilter } from '../../src/common/errors/global-exception.filter.js';
import configuration from '../../src/config/configuration.js';
import type { PermissionKey } from '../../src/config/permissions.catalog.js';
import { PrismaModule } from '../../src/infrastructure/database/prisma/prisma.module.js';
import { PrismaService } from '../../src/infrastructure/database/prisma/prisma.service.js';
import { Authenticated, RequirePermissions } from '../../src/modules/identity/decorators/require-permissions.decorator.js';
import { IdentityModule } from '../../src/modules/identity/identity.module.js';
import { TokenService } from '../../src/modules/identity/services/token.service.js';

const USE = 'test-access:use' as PermissionKey;
const OTHER = 'test-access:other' as PermissionKey;

@Controller('test-access')
class TestAccessController {
  @Get('public')
  open() {
    return { ok: true };
  }

  @Get('session')
  @Authenticated()
  session() {
    return { ok: true };
  }

  @Get('protected')
  @RequirePermissions(USE)
  protectedRoute() {
    return { ok: true };
  }

  @Get('both')
  @RequirePermissions(USE, OTHER)
  both() {
    return { ok: true };
  }
}

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [configuration] }), PrismaModule, IdentityModule],
  controllers: [TestAccessController],
})
class TestAccessModule {}

describe('Control de acceso (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tokens: TokenService;
  let jwt: JwtService;
  const ids = { persons: [] as string[], roles: [] as string[], permissions: [] as string[] };
  let permissionUse: string;
  let permissionOther: string;
  let counter = 0;

  const grant = (roleId: string, permissionId: string) =>
    prisma.rolePermission.create({ data: { roleId, permissionId } });

  async function createRole(isActive = true) {
    const role = await prisma.role.create({
      data: { name: `test_access_${Date.now()}_${counter++}`, displayName: 'Prueba', isActive },
    });
    ids.roles.push(role.id);
    return role;
  }

  // Crea un usuario de prueba con los roles indicados y devuelve su id.
  async function createUser(options: { roles?: { id: string; expiresAt?: Date }[]; status?: 'ACTIVE' | 'INACTIVE' } = {}) {
    const n = `${Date.now()}${counter++}`;
    const person = await prisma.person.create({
      data: {
        identification: `98${n.slice(-8)}`,
        firstName: 'Prueba',
        lastName: 'Acceso',
        email: `acceso.${n}@vetmanage.test`,
      },
    });
    ids.persons.push(person.id);
    const user = await prisma.user.create({
      data: {
        personId: person.id,
        status: options.status ?? 'ACTIVE',
        userRoles: { create: (options.roles ?? []).map((role) => ({ roleId: role.id, expiresAt: role.expiresAt })) },
      },
    });
    return user.id;
  }

  const get = (path: string, token?: string) => {
    const call = request(app.getHttpServer()).get(`/test-access/${path}`);
    return token ? call.set('Authorization', `Bearer ${token}`) : call;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [TestAccessModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
    prisma = app.get(PrismaService);
    tokens = app.get(TokenService);
    jwt = app.get(JwtService);

    await prisma.permission.deleteMany({ where: { module: 'test-access' } });
    const use = await prisma.permission.create({ data: { module: 'test-access', action: 'use', displayName: 'Prueba' } });
    const other = await prisma.permission.create({ data: { module: 'test-access', action: 'other', displayName: 'Prueba' } });
    ids.permissions.push(use.id, other.id);
    permissionUse = use.id;
    permissionOther = other.id;
  });

  afterAll(async () => {
    if (!prisma) return;
    await prisma.user.deleteMany({ where: { personId: { in: ids.persons } } });
    await prisma.person.deleteMany({ where: { id: { in: ids.persons } } });
    await prisma.role.deleteMany({ where: { id: { in: ids.roles } } });
    await prisma.permission.deleteMany({ where: { id: { in: ids.permissions } } });
    await app.close();
  });

  it('una ruta sin decorador sigue siendo pública', async () => {
    await get('public').expect(200);
  });

  it('rechaza con 401 una petición sin token', async () => {
    const response = await get('session').expect(401);

    expect(response.body.success).toBe(false);
    await get('protected').expect(401);
  });

  it('rechaza con 401 un token inválido o con esquema incorrecto', async () => {
    await get('session', 'no-es-un-token').expect(401);
    await request(app.getHttpServer()).get('/test-access/session').set('Authorization', 'Basic abc').expect(401);
  });

  it('rechaza con 401 un token vencido', async () => {
    const userId = await createUser();
    const expired = await jwt.signAsync({ sub: userId, exp: Math.floor(Date.now() / 1000) - 60 });

    await get('session', expired).expect(401);
  });

  it('rechaza con 401 a un usuario inactivo o inexistente', async () => {
    const inactive = await createUser({ status: 'INACTIVE' });

    await get('session', await tokens.issue(inactive)).expect(401);
    await get('session', await tokens.issue('00000000-0000-4000-8000-000000000000')).expect(401);
  });

  it('deja pasar con sesión válida si la ruta no pide permisos', async () => {
    const userId = await createUser();

    await get('session', await tokens.issue(userId)).expect(200);
  });

  it('rechaza con 403 al usuario sin el permiso y deja pasar al que lo tiene', async () => {
    const role = await createRole();
    await grant(role.id, permissionUse);
    const withPermission = await createUser({ roles: [role] });
    const without = await createUser();

    const denied = await get('protected', await tokens.issue(without)).expect(403);
    expect(denied.body.message).toBe('No tiene permisos para realizar esta acción');
    await get('protected', await tokens.issue(withPermission)).expect(200);
  });

  it('suma los permisos de varios roles', async () => {
    const roleA = await createRole();
    const roleB = await createRole();
    await grant(roleA.id, permissionUse);
    await grant(roleB.id, permissionOther);
    const both = await createUser({ roles: [roleA, roleB] });
    const onlyA = await createUser({ roles: [roleA] });

    await get('both', await tokens.issue(both)).expect(200);
    await get('both', await tokens.issue(onlyA)).expect(403);
  });

  it('ignora roles inactivos, asignaciones vencidas y permisos inactivos', async () => {
    const inactiveRole = await createRole(false);
    await grant(inactiveRole.id, permissionUse);
    const activeRole = await createRole();
    await grant(activeRole.id, permissionUse);
    const viaInactiveRole = await createUser({ roles: [inactiveRole] });
    const viaExpiredAssignment = await createUser({ roles: [{ id: activeRole.id, expiresAt: new Date(Date.now() - 60_000) }] });
    const valid = await createUser({ roles: [activeRole] });

    await get('protected', await tokens.issue(viaInactiveRole)).expect(403);
    await get('protected', await tokens.issue(viaExpiredAssignment)).expect(403);
    await get('protected', await tokens.issue(valid)).expect(200);

    await prisma.permission.update({ where: { id: permissionUse }, data: { isActive: false } });
    await get('protected', await tokens.issue(valid)).expect(403);
    await prisma.permission.update({ where: { id: permissionUse }, data: { isActive: true } });
  });

  it('aplica de inmediato un cambio de permisos con el mismo token', async () => {
    const role = await createRole();
    await grant(role.id, permissionUse);
    const token = await tokens.issue(await createUser({ roles: [role] }));

    await get('protected', token).expect(200);
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await get('protected', token).expect(403);
  });
});
