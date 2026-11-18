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
    await prisma.userSession.deleteMany({ where: { user: { personId: { in: ids.persons } } } });
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

  it('rechaza un correo con formato inválido', async () => {
    const { body } = await login({ email: 'correo-invalido', password: PASSWORD }).expect(400);

    expect(body.message).toBe('Ingrese un correo electrónico válido');
  });

  it('responde igual con contraseña incorrecta y correo no registrado, indicando los intentos restantes', async () => {
    const user = await createUser();

    const wrong = await login({ email: user.email, password: 'Otra1234' }).expect(401);
    const unknown = await login({ email: `nadie.${Date.now()}@vetmanage.test`, password: PASSWORD }).expect(401);

    const expected = 'Correo o contraseña incorrectos. Le quedan 4 intentos antes de que la cuenta se bloquee';
    expect(wrong.body.message).toBe(expected);
    expect(unknown.body.message).toBe(expected);
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

  it('guarda el refresh token en una cookie httpOnly y no lo devuelve en el cuerpo', async () => {
    const user = await createUser();

    const response = await login({ email: user.email, password: PASSWORD }).expect(200);

    const cookie = String(response.headers['set-cookie']);
    expect(cookie).toMatch(/vetmanage_refresh=[^;]+;/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/Path=\/auth/);
    expect(response.body.data.refreshToken).toBeUndefined();
  });

  it('renueva la sesión rotando el refresh token', async () => {
    const user = await createUser();
    const agent = request.agent(app.getHttpServer());
    await agent.post('/auth/login').send({ email: user.email, password: PASSWORD }).expect(200);
    const firstSession = await prisma.userSession.findFirstOrThrow({ where: { userId: user.id } });

    const refreshed = await agent.post('/auth/refresh').expect(200);

    expect(refreshed.body.data.accessToken).toEqual(expect.any(String));
    expect(refreshed.body.data.user.id).toBe(user.id);
    const sessions = await prisma.userSession.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'asc' } });
    expect(sessions).toHaveLength(2);
    expect(sessions[0]).toMatchObject({ id: firstSession.id, revokedAt: expect.any(Date) });
    expect(sessions[1].revokedAt).toBeNull();
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${refreshed.body.data.accessToken}`)
      .expect(200);
  });

  it('no acepta un refresh token ya usado', async () => {
    const user = await createUser();
    const response = await login({ email: user.email, password: PASSWORD }).expect(200);
    const cookie = String(response.headers['set-cookie']).split(';')[0];

    await request(app.getHttpServer()).post('/auth/refresh').set('Cookie', cookie).expect(200);
    const reused = await request(app.getHttpServer()).post('/auth/refresh').set('Cookie', cookie).expect(401);

    expect(reused.body.message).toBe('La sesión expiró. Inicie sesión nuevamente');
  });

  it('no renueva sin cookie, con la sesión vencida o con la cuenta desactivada', async () => {
    await request(app.getHttpServer()).post('/auth/refresh').expect(401);

    const expired = await createUser();
    const agentExpired = request.agent(app.getHttpServer());
    await agentExpired.post('/auth/login').send({ email: expired.email, password: PASSWORD }).expect(200);
    await prisma.userSession.updateMany({ where: { userId: expired.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
    await agentExpired.post('/auth/refresh').expect(401);

    const disabled = await createUser();
    const agentDisabled = request.agent(app.getHttpServer());
    await agentDisabled.post('/auth/login').send({ email: disabled.email, password: PASSWORD }).expect(200);
    await prisma.user.update({ where: { id: disabled.id }, data: { status: 'INACTIVE' } });
    await agentDisabled.post('/auth/refresh').expect(401);
  });

  it('cierra la sesión revocando el refresh token', async () => {
    const user = await createUser();
    const agent = request.agent(app.getHttpServer());
    await agent.post('/auth/login').send({ email: user.email, password: PASSWORD }).expect(200);

    await agent.post('/auth/logout').expect(200);

    const session = await prisma.userSession.findFirstOrThrow({ where: { userId: user.id } });
    expect(session.revokedAt).toEqual(expect.any(Date));
    await agent.post('/auth/refresh').expect(401);
  });
});
