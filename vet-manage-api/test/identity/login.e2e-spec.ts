import { INestApplication, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { GlobalExceptionFilter } from '../../src/common/errors/global-exception.filter.js';
import configuration from '../../src/config/configuration.js';
import { PrismaModule } from '../../src/infrastructure/database/prisma/prisma.module.js';
import { PrismaService } from '../../src/infrastructure/database/prisma/prisma.service.js';
import { IdentityModule } from '../../src/modules/identity/identity.module.js';
import { PasswordHasher } from '../../src/modules/identity/services/password-hasher.service.js';

const PASSWORD = 'Vet12345';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [configuration] }), PrismaModule, IdentityModule],
})
class TestLoginModule {}

describe('Inicio de sesión (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let passwordHash: string;
  const ids = { persons: [] as string[], roles: [] as string[], permissions: [] as string[] };
  let counter = 0;

  async function createRole(displayName: string, permissionKeys: string[]) {
    const role = await prisma.role.create({
      data: { name: `test_login_${Date.now()}_${counter++}`, displayName },
    });
    ids.roles.push(role.id);
    for (const key of permissionKeys) {
      const [module, action] = key.split(':');
      const permission = await prisma.permission.upsert({
        where: { permission_module_action_key: { module, action } },
        update: {},
        create: { module, action, displayName: key },
      });
      if (!ids.permissions.includes(permission.id)) ids.permissions.push(permission.id);
      await prisma.rolePermission.create({ data: { roleId: role.id, permissionId: permission.id } });
    }
    return role;
  }

  // Crea un usuario con contraseña y devuelve su id y correo.
  async function createUser(options: {
    roles?: { id: string }[];
    status?: 'ACTIVE' | 'INACTIVE' | 'DEACTIVATED';
    mustChangePassword?: boolean;
  } = {}) {
    const n = `${Date.now()}${counter++}`;
    const email = `login.${n}@vetmanage.test`;
    const person = await prisma.person.create({
      data: { identification: `97${n.slice(-8)}`, firstName: 'Jorge', lastName: 'Solís', email },
    });
    ids.persons.push(person.id);
    const user = await prisma.user.create({
      data: {
        personId: person.id,
        password: passwordHash,
        status: options.status ?? 'ACTIVE',
        mustChangePassword: options.mustChangePassword ?? false,
        userRoles: { create: (options.roles ?? []).map((role) => ({ roleId: role.id })) },
      },
    });
    return { id: user.id, email };
  }

  const login = (body: object) => request(app.getHttpServer()).post('/auth/login').send(body);
  const attempts = (id: string) =>
    prisma.user.findUniqueOrThrow({ where: { id }, select: { failedLoginAttempts: true, isLocked: true, lockedAt: true } });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [TestLoginModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    await app.init();
    prisma = app.get(PrismaService);
    passwordHash = await app.get(PasswordHasher).hash(PASSWORD);
    await prisma.permission.deleteMany({ where: { module: 'test-login' } });
  });

  afterAll(async () => {
    if (!prisma) return;
    await prisma.user.deleteMany({ where: { personId: { in: ids.persons } } });
    await prisma.person.deleteMany({ where: { id: { in: ids.persons } } });
    await prisma.role.deleteMany({ where: { id: { in: ids.roles } } });
    await prisma.permission.deleteMany({ where: { module: 'test-login' } });
    await app.close();
  });

  it('inicia sesión y devuelve token, roles y permisos', async () => {
    const role = await createRole('Veterinario de prueba', ['test-login:read']);
    const user = await createUser({ roles: [role] });

    const response = await login({ email: user.email, password: PASSWORD }).expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.mustChangePassword).toBe(false);
    expect(response.body.data.user).toMatchObject({
      id: user.id,
      firstName: 'Jorge',
      email: user.email,
      roles: [{ name: role.name, displayName: 'Veterinario de prueba' }],
      permissions: ['test-login:read'],
    });
  });

  it('suma roles y permisos de un usuario con varios roles', async () => {
    const manager = await createRole('Gerente de prueba', ['test-login:report']);
    const admin = await createRole('Administrador de prueba', ['test-login:manage']);
    const user = await createUser({ roles: [manager, admin] });

    const { body } = await login({ email: user.email, password: PASSWORD }).expect(200);

    expect(body.data.user.roles).toHaveLength(2);
    expect(body.data.user.permissions).toEqual(['test-login:manage', 'test-login:report']);
  });

  it('acepta el correo en mayúsculas y con espacios', async () => {
    const user = await createUser();

    await login({ email: `  ${user.email.toUpperCase()} `, password: PASSWORD }).expect(200);
  });

  it('indica el cambio obligatorio de contraseña', async () => {
    const user = await createUser({ mustChangePassword: true });

    const { body } = await login({ email: user.email, password: PASSWORD }).expect(200);

    expect(body.data.mustChangePassword).toBe(true);
  });

  it('pide correo y contraseña cuando falta alguno', async () => {
    for (const body of [{}, { email: 'a@vetmanage.test' }, { email: '', password: PASSWORD }]) {
      const response = await login(body).expect(400);
      expect(response.body.message).toBe('Ingrese su correo y contraseña');
    }
  });

  it('responde igual con contraseña incorrecta y correo no registrado', async () => {
    const user = await createUser();

    const wrong = await login({ email: user.email, password: 'Otra1234' }).expect(401);
    const unknown = await login({ email: 'nadie@vetmanage.test', password: PASSWORD }).expect(401);

    expect(wrong.body.message).toBe('Correo o contraseña incorrectos');
    expect(unknown.body.message).toBe('Correo o contraseña incorrectos');
  });

  it('bloquea la cuenta al quinto intento fallido y niega el acceso durante el bloqueo', async () => {
    const user = await createUser();
    for (let i = 0; i < 4; i++) await login({ email: user.email, password: 'Otra1234' }).expect(401);

    const fifth = await login({ email: user.email, password: 'Otra1234' }).expect(423);
    expect(fifth.body.message).toBe('Cuenta bloqueada temporalmente. Intente en 15 minutos');

    const during = await login({ email: user.email, password: PASSWORD }).expect(423);
    expect(during.body.message).toBe('Cuenta bloqueada temporalmente. Intente en 15 minutos');
    expect(await attempts(user.id)).toMatchObject({ isLocked: true });
  });

  it('calcula los minutos restantes del bloqueo', async () => {
    const user = await createUser();
    await prisma.user.update({
      where: { id: user.id },
      data: { isLocked: true, lockedAt: new Date(Date.now() - 5 * 60_000) },
    });

    const { body } = await login({ email: user.email, password: PASSWORD }).expect(423);

    expect(body.message).toBe('Cuenta bloqueada temporalmente. Intente en 10 minutos');
  });

  it('permite el acceso cuando el bloqueo venció', async () => {
    const user = await createUser();
    await prisma.user.update({
      where: { id: user.id },
      data: { isLocked: true, lockedAt: new Date(Date.now() - 16 * 60_000) },
    });

    await login({ email: user.email, password: PASSWORD }).expect(200);
    expect(await attempts(user.id)).toMatchObject({ isLocked: false, lockedAt: null, failedLoginAttempts: 0 });
  });

  it('reinicia el contador al iniciar sesión correctamente', async () => {
    const user = await createUser();
    for (let i = 0; i < 3; i++) await login({ email: user.email, password: 'Otra1234' }).expect(401);
    expect((await attempts(user.id)).failedLoginAttempts).toBe(3);

    await login({ email: user.email, password: PASSWORD }).expect(200);

    expect((await attempts(user.id)).failedLoginAttempts).toBe(0);
  });

  it.each(['INACTIVE', 'DEACTIVATED'] as const)('niega el acceso a una cuenta %s', async (status) => {
    const user = await createUser({ status });

    const { body } = await login({ email: user.email, password: PASSWORD }).expect(403);

    expect(body.message).toBe('Su cuenta se encuentra desactivada. Contacte al administrador');
  });

  it('devuelve el perfil de la sesión con el token', async () => {
    const role = await createRole('Recepcionista de prueba', ['test-login:read']);
    const user = await createUser({ roles: [role] });
    const { body } = await login({ email: user.email, password: PASSWORD }).expect(200);

    const me = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${body.data.accessToken}`)
      .expect(200);

    expect(me.body.data.user).toEqual(body.data.user);
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });
});
