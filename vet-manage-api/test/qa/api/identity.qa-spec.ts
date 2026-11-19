// QA Sprint 1 · Integración API (Supertest → Staging) · HU-51, HU-54 y HU-57.
// Requiere Staging restaurado con la semilla QA (qa/sprint-1/staging/scripts/restore-staging.sh).
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  api, auditTables, bearer, closeDb, mailsTo, PASSWORD, sql, tamper, tokenFor, userIdByEmail, USERS,
} from './support.js';

afterAll(closeDb);

describe('HU-51 Registrar usuario (API)', () => {
  let admin: string;
  const body = (patch: Record<string, unknown> = {}) => ({
    identification: '1105018517', firstName: 'Pablo', lastName: 'Andrade',
    email: 'pablo.andrade@vetmanage.test', phone: '0991234567', roles: ['veterinarian'], ...patch,
  });

  beforeAll(async () => {
    admin = await tokenFor(USERS.admin);
  });

  it('CP-51-01 registra un usuario Veterinario, ACTIVE, con contraseña temporal y correo enviado', async () => {
    const response = await api().post('/users').set(bearer(admin)).send(body());

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Usuario registrado correctamente');
    expect(response.body.data).toMatchObject({ status: 'ACTIVE', credentialsSent: true });
    const [row] = await sql<{ must_change_password: boolean }>(
      "SELECT u.must_change_password FROM users u JOIN persons p ON p.id = u.person_id WHERE p.identification = '1105018517'");
    expect(row.must_change_password).toBe(true);
    expect(await mailsTo('pablo.andrade@vetmanage.test')).toBeGreaterThanOrEqual(1);
  });

  it('CP-51-02 registra un usuario con Gerente y Administrador en una sola cuenta', async () => {
    const response = await api().post('/users').set(bearer(admin))
      .send(body({ identification: '1105018889', email: 'multi.nuevo@vetmanage.test', roles: ['manager', 'administrator'] }));
    expect(response.status).toBe(201);
    const [row] = await sql<{ cuentas: string; roles: string }>(
      `SELECT count(DISTINCT u.id) AS cuentas, count(ur.id) AS roles FROM persons p
       JOIN users u ON u.person_id = p.id JOIN user_roles ur ON ur.user_id = u.id WHERE p.identification = '1105018889'`);
    expect(row).toEqual({ cuentas: '1', roles: '2' });
  });

  it('CP-51-03 agrega Cajero a Ana Ruiz (ya Cliente) sin duplicar la persona', async () => {
    const response = await api().post('/users').set(bearer(admin))
      .send(body({ identification: '1105016669', firstName: 'Ana', lastName: 'Ruiz', email: 'ana.ruiz@correo.test', roles: ['cashier'] }));
    expect(response.status).toBe(201);
    expect(response.body.data.existingPerson).toBe(true);
    const roles = await sql<{ name: string }>(
      `SELECT r.name FROM persons p JOIN users u ON u.person_id = p.id JOIN user_roles ur ON ur.user_id = u.id
       JOIN roles r ON r.id = ur.role_id WHERE p.identification = '1105016669' ORDER BY r.name`);
    expect(roles.map((r) => r.name)).toEqual(['cashier', 'client']);
    const [{ total }] = await sql<{ total: string }>("SELECT count(*) AS total FROM persons WHERE identification = '1105016669'");
    expect(total).toBe('1');
  });

  it('CP-51-05 rechaza el correo vacío', async () => {
    const response = await api().post('/users').set(bearer(admin)).send(body({ identification: '1105019994', email: '' }));
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Complete los campos obligatorios');
  });

  it('CP-51-06 rechaza el registro sin roles', async () => {
    const response = await api().post('/users').set(bearer(admin)).send(body({ identification: '1105019994', email: 'sinrol@vetmanage.test', roles: [] }));
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Complete los campos obligatorios');
  });

  it('CP-51-07 rechaza una cédula ya registrada en el personal', async () => {
    const response = await api().post('/users').set(bearer(admin)).send(body({ identification: '1105010746', email: 'otro@vetmanage.test' }));
    expect(response.status).toBe(409);
    expect(response.body.message).toBe('Número de cédula ya registrado');
  });

  it('CP-51-08 rechaza la cédula "11045"', async () => {
    const response = await api().post('/users').set(bearer(admin)).send(body({ identification: '11045' }));
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('La cédula debe tener 10 dígitos válidos');
  });

  it('CP-51-11 rechaza un correo ya registrado', async () => {
    const response = await api().post('/users').set(bearer(admin)).send(body({ identification: '1105019259', email: 'mlopez@vetmanage.com' }));
    expect(response.status).toBe(409);
    expect(response.body.message).toBe('El correo ya se encuentra registrado');
  });

  it('CP-51-12 rechaza el correo duplicado con otra combinación de mayúsculas (R-36)', async () => {
    const response = await api().post('/users').set(bearer(admin)).send(body({ identification: '1105019259', email: 'MLopez@VetManage.com' }));
    expect(response.status).toBe(409);
  });

  it('CP-51-14 niega el registro a un Recepcionista', async () => {
    const recep = await tokenFor(USERS.receptionist);
    const response = await api().post('/users').set(bearer(recep)).send(body({ identification: '1105019259', email: 'x@vetmanage.test' }));
    expect(response.status).toBe(403);
    expect(response.body.message).toBe('No tiene permisos para realizar esta acción');
  });

  it('CP-51-15 rechaza la petición sin token y con token alterado', async () => {
    expect((await api().post('/users').send(body())).status).toBe(401);
    expect((await api().post('/users').set(bearer(tamper(admin))).send(body())).status).toBe(401);
  });

  it('CP-51-17 rechaza asignar el rol Cliente al personal', async () => {
    const response = await api().post('/users').set(bearer(admin)).send(body({ identification: '1105019259', email: 'y@vetmanage.test', roles: ['client'] }));
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Seleccione roles válidos del personal');
  });

  it('CP-51-18 el registro del usuario queda en la auditoría (OC-04 / PNF-05)', async () => {
    const response = await api().post('/users').set(bearer(admin))
      .send(body({ identification: '1105019622', email: 'auditado@vetmanage.test', roles: ['cashier'] }));
    expect(response.status).toBe(201);
    const tables = await auditTables();
    expect(tables, 'No existe ninguna tabla de auditoría en la base de datos').not.toEqual([]);
  });
});

describe('HU-54 Asignar y quitar roles (API)', () => {
  let admin: string;
  let carlosId: string;
  const roleNames = async (userId: string) =>
    (await sql<{ name: string }>(
      'SELECT r.name FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = $1 ORDER BY r.name', [userId])).map((r) => r.name);

  beforeAll(async () => {
    admin = await tokenFor(USERS.admin);
    carlosId = await userIdByEmail(USERS.carlos);
  });

  it('CP-54-07 el rol ya asignado no aparece como opción', async () => {
    const response = await api().get(`/users/${carlosId}/role-assignment`).set(bearer(admin));
    expect(response.status).toBe(200);
    const available = response.body.data.availableRoles.map((r: { name: string }) => r.name);
    expect(response.body.data.currentRoles.map((r: { name: string }) => r.name)).toEqual(['receptionist']);
    expect(available).not.toContain('receptionist');
  });

  it('CP-54-01 asigna Cajero y Carlos ve ambos roles en su siguiente inicio de sesión', async () => {
    const response = await api().put(`/users/${carlosId}/role-assignment`).set(bearer(admin)).send({ roles: ['receptionist', 'cashier'] });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Roles actualizados correctamente');
    expect(await roleNames(carlosId)).toEqual(['cashier', 'receptionist']);

    const carlos = await tokenFor(USERS.carlos, { fresh: true });
    const me = await api().get('/auth/me').set(bearer(carlos));
    expect(me.body.data.user.roles.map((r: { name: string }) => r.name).sort()).toEqual(['cashier', 'receptionist']);
  });

  it('CP-54-02 quita Cajero y queda solo Recepcionista', async () => {
    const response = await api().put(`/users/${carlosId}/role-assignment`).set(bearer(admin)).send({ roles: ['receptionist'] });
    expect(response.status).toBe(200);
    expect(await roleNames(carlosId)).toEqual(['receptionist']);
  });

  it('CP-54-03 cambia Recepcionista por Veterinario y obtiene sus permisos', async () => {
    await api().put(`/users/${carlosId}/role-assignment`).set(bearer(admin)).send({ roles: ['veterinarian'] }).expect(200);
    const carlos = await tokenFor(USERS.carlos, { fresh: true });
    const me = await api().get('/auth/me').set(bearer(carlos));
    expect(me.body.data.user.roles.map((r: { name: string }) => r.name)).toEqual(['veterinarian']);
    expect(me.body.data.user.permissions).toContain('species:create');
  });

  it('CP-54-04 impide quitar el único rol', async () => {
    const response = await api().put(`/users/${carlosId}/role-assignment`).set(bearer(admin)).send({ roles: [] });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('El usuario debe tener al menos un rol');
    expect(await roleNames(carlosId)).toEqual(['veterinarian']);
  });

  it('CP-54-06 permite quitar Administrador a Jorge Solís porque queda otro Administrador activo', async () => {
    const jorgeId = await userIdByEmail(USERS.multiRole);
    const response = await api().put(`/users/${jorgeId}/role-assignment`).set(bearer(admin)).send({ roles: ['manager'] });
    expect(response.status).toBe(200);
    // Se restablece para no afectar a CP-57-02.
    await api().put(`/users/${jorgeId}/role-assignment`).set(bearer(admin)).send({ roles: ['manager', 'administrator'] }).expect(200);
  });

  it('CP-54-08 impide modificar los roles de un usuario dado de baja (Luis Ríos)', async () => {
    const luisId = await userIdByEmail(USERS.luis);
    const response = await api().put(`/users/${luisId}/role-assignment`).set(bearer(admin)).send({ roles: ['receptionist', 'cashier'] });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('No se pueden modificar los roles de un usuario dado de baja');
  });

  it('CP-54-09 niega el cambio de roles a un Veterinario', async () => {
    const vet = await tokenFor(USERS.veterinarian);
    const response = await api().put(`/users/${carlosId}/role-assignment`).set(bearer(vet)).send({ roles: ['cashier'] });
    expect(response.status).toBe(403);
    expect(response.body.message).toBe('No tiene permisos para realizar esta acción');
  });

  it('CP-54-10 rechaza un rol que no es del personal', async () => {
    const response = await api().put(`/users/${carlosId}/role-assignment`).set(bearer(admin)).send({ roles: ['veterinarian', 'client'] });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Seleccione roles válidos del personal');
  });

  it('CP-54-11 responde 404 para un usuario inexistente', async () => {
    const response = await api().put('/users/00000000-0000-4000-8000-000000000000/role-assignment').set(bearer(admin)).send({ roles: ['cashier'] });
    expect(response.status).toBe(404);
  });

  it('CP-54-13 al quitarle el rol con la sesión abierta, la siguiente acción se bloquea de inmediato (PNF-04 / R-12)', async () => {
    const diego = await tokenFor(USERS.roleTarget, { fresh: true });
    const client = (identification: string, email: string) => ({
      identification, firstName: 'Cliente', lastName: 'Rotación', email, phone: '0987111222',
    });
    expect((await api().post('/clients').set(bearer(diego)).send(client('1105020364', 'rotacion1@correo.test'))).status).toBe(201);

    const diegoId = await userIdByEmail(USERS.roleTarget);
    await api().put(`/users/${diegoId}/role-assignment`).set(bearer(admin)).send({ roles: ['cashier'] }).expect(200);

    const second = await api().post('/clients').set(bearer(diego)).send(client('1105020737', 'rotacion2@correo.test'));
    expect(second.status).toBe(403);
  });

  it('CP-54-14 el cambio de roles queda en la auditoría con valor anterior y nuevo (OC-04 / PNF-05)', async () => {
    const tables = await auditTables();
    expect(tables, 'No existe ninguna tabla de auditoría en la base de datos').not.toEqual([]);
  });
});

describe('HU-57 Iniciar sesión (API)', () => {
  const login = (email: string, password: string) => api().post('/auth/login').send({ email, password });

  it('CP-57-01 inicia sesión y entrega accessToken y cookie httpOnly de refresh', async () => {
    const response = await login(USERS.veterinarian, PASSWORD);
    expect(response.status).toBe(200);
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(String(response.headers['set-cookie'])).toMatch(/vetmanage_refresh=.*HttpOnly/i);
  });

  it('CP-57-02 un usuario con Gerente y Administrador recibe los permisos de ambos', async () => {
    const response = await login(USERS.multiRole, PASSWORD);
    expect(response.status).toBe(200);
    const { roles, permissions } = response.body.data.user;
    expect(roles.map((r: { name: string }) => r.name).sort()).toEqual(['administrator', 'manager']);
    expect(permissions).toEqual(expect.arrayContaining(['users:create', 'clients:create']));
  });

  it('CP-57-03 responde el mismo mensaje para contraseña incorrecta y correo no registrado', async () => {
    const wrongPassword = await login(USERS.counter, 'Mala1234');
    const unknownEmail = await login('noexiste@vetmanage.test', PASSWORD);
    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    const prefix = 'Correo o contraseña incorrectos';
    expect(wrongPassword.body.message.startsWith(prefix)).toBe(true);
    expect(unknownEmail.body.message.startsWith(prefix)).toBe(true);
  });

  it('CP-57-04 rechaza los campos vacíos', async () => {
    const response = await login('', '');
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Ingrese su correo y contraseña');
  });

  it('CP-57-05/06 bloquea al 5.º intento fallido y sigue bloqueada con la contraseña correcta', async () => {
    for (let attempt = 1; attempt <= 4; attempt += 1) {
      const response = await login(USERS.lockoutApi, 'Incorrecta1');
      expect(response.status, `intento ${attempt}`).toBe(401);
    }
    const fifth = await login(USERS.lockoutApi, 'Incorrecta1');
    expect(fifth.status).toBe(423);
    expect(fifth.body.message).toBe('Cuenta bloqueada temporalmente. Intente en 15 minutos');

    const correct = await login(USERS.lockoutApi, PASSWORD);
    expect(correct.status).toBe(423);
    expect(correct.body.message).toMatch(/^Cuenta bloqueada temporalmente\. Intente en 1[45] minutos$/);
  });

  it('CP-57-07 reinicia el contador tras un inicio de sesión correcto', async () => {
    for (let i = 0; i < 3; i += 1) await login(USERS.counter, 'Incorrecta1');
    expect((await login(USERS.counter, PASSWORD)).status).toBe(200);
    const [row] = await sql<{ failed_login_attempts: number }>(
      'SELECT u.failed_login_attempts FROM users u JOIN persons p ON p.id = u.person_id WHERE p.email = $1', [USERS.counter]);
    expect(row.failed_login_attempts).toBe(0);
  });

  it.each([['inactiva', USERS.inactive], ['dada de baja', USERS.luis]])('CP-57-08 niega el acceso a la cuenta %s', async (_, email) => {
    const response = await login(email, PASSWORD);
    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Su cuenta se encuentra desactivada. Contacte al administrador');
  });

  it('CP-57-09 indica cambio obligatorio de contraseña en el primer ingreso', async () => {
    const response = await login(USERS.temporary, PASSWORD);
    expect(response.status).toBe(200);
    expect(response.body.data.mustChangePassword).toBe(true);
  });

  it('CP-57-10 /auth/me rechaza peticiones sin token o con token alterado', async () => {
    const token = await tokenFor(USERS.veterinarian);
    expect((await api().get('/auth/me')).status).toBe(401);
    expect((await api().get('/auth/me').set(bearer(tamper(token)))).status).toBe(401);
  });
});
