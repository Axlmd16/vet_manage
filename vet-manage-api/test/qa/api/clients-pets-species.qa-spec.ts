// QA Sprint 1 · Integración API (Supertest → Staging) · HU-01, HU-07 y HU-13.
// Los mensajes esperados son los textos de los criterios de aceptación de cada HU.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  api, bearer, clientIdByIdentification, closeDb, speciesAndBreed, sql, todayClinic, tokenFor, USERS,
} from './support.js';

afterAll(closeDb);

describe('HU-01 Registrar datos del cliente (API)', () => {
  let recep: string;
  const body = (patch: Record<string, unknown> = {}) => ({
    identification: '1105019994', firstName: 'Mateo', lastName: 'Cueva', email: 'mateo.cueva@correo.test',
    phone: '0987654321', address: 'Av. Orillas del Zamora', ...patch,
  });

  beforeAll(async () => {
    recep = await tokenFor(USERS.receptionist);
  });

  it('CP-01-01 registra un cliente válido en estado Activo con el mensaje de la HU', async () => {
    const response = await api().post('/clients').set(bearer(recep)).send(body());
    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe('ACTIVE');
    expect(response.body.message).toBe('Cliente registrado exitosamente');
  });

  it('CP-01-02 registra un cliente sin dirección', async () => {
    const response = await api().post('/clients').set(bearer(recep))
      .send(body({ identification: '1105030009', email: 'sin.direccion@correo.test', address: '' }));
    expect(response.status).toBe(201);
    expect(response.body.data.address).toBeNull();
  });

  it.each([['Veterinario', USERS.veterinarian, '1105030413'], ['Gerente', USERS.manager, '1105030827']])(
    'CP-01-03 el %s también puede registrar clientes',
    async (_, email, identification) => {
      const token = await tokenFor(email);
      const response = await api().post('/clients').set(bearer(token)).send(body({ identification, email: `c${identification}@correo.test` }));
      expect(response.status).toBe(201);
    },
  );

  it('CP-01-04 rechaza los obligatorios vacíos con el mensaje de la HU', async () => {
    const response = await api().post('/clients').set(bearer(recep))
      .send({ identification: '', firstName: '', lastName: '', email: '', phone: '' });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Por favor, complete todos los campos obligatorios');
  });

  it('CP-01-05 rechaza el registro sin teléfono (obligatorio en la HU)', async () => {
    const response = await api().post('/clients').set(bearer(recep))
      .send(body({ identification: '1105031239', email: 'sin.telefono@correo.test', phone: '' }));
    expect(response.status).toBe(400);
  });

  it('CP-01-06 rechaza una cédula que ya pertenece a un cliente (Pedro Castillo)', async () => {
    const response = await api().post('/clients').set(bearer(recep))
      .send(body({ identification: '1105017030', firstName: 'Otro', email: 'otro.pedro@correo.test' }));
    expect(response.status).toBe(409);
    expect(response.body.message).toBe('Número de cédula ya registrado');
  });

  it('CP-01-07 rechaza una cédula alfanumérica con "Número de cédula no válido"', async () => {
    const response = await api().post('/clients').set(bearer(recep)).send(body({ identification: '11050A0001' }));
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Número de cédula no válido');
  });

  it('CP-01-09 rechaza un correo sin formato', async () => {
    const response = await api().post('/clients').set(bearer(recep)).send(body({ identification: '1105031643', email: 'mateo.correo.test' }));
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Por favor, ingrese un correo y número de teléfono válido');
  });

  it('CP-01-10 rechaza un teléfono con letras', async () => {
    const response = await api().post('/clients').set(bearer(recep)).send(body({ identification: '1105031643', email: 'tel.letras@correo.test', phone: '09876ABCDE' }));
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Por favor, ingrese un correo y número de teléfono válido');
  });

  it('CP-01-11 rechaza un teléfono de 9 dígitos (valor límite)', async () => {
    const response = await api().post('/clients').set(bearer(recep)).send(body({ identification: '1105032054', email: 'tel.nueve@correo.test', phone: '098765432' }));
    expect(response.status).toBe(400);
  });

  it('CP-01-12 rechaza un teléfono con prefijo inválido', async () => {
    const response = await api().post('/clients').set(bearer(recep)).send(body({ identification: '1105032468', email: 'tel.prefijo@correo.test', phone: '1987654321' }));
    expect(response.status).toBe(400);
  });

  it.each([['Cajero', USERS.cashier], ['Técnico Veterinario', USERS.technician], ['Administrador', USERS.admin]])(
    'CP-01-14 niega el registro al %s',
    async (_, email) => {
      const token = await tokenFor(email);
      const response = await api().post('/clients').set(bearer(token)).send(body({ identification: '1105032872', email: 'denegado@correo.test' }));
      expect(response.status).toBe(403);
      expect(response.body.message).toBe('No tiene permisos para realizar esta acción');
    },
  );
});

describe('HU-07 Registrar datos del paciente (API)', () => {
  let recep: string;
  let pedro: string;
  let labrador: { speciesId: string; breedId: string | null };

  const body = (patch: Record<string, unknown> = {}) => ({
    name: 'Max', speciesId: labrador.speciesId, breedId: labrador.breedId, sex: 'MALE', birthDate: '10-02-2024',
    weightKg: 20.5, heightCm: 55, reproductiveStatus: 'NOT_STERILIZED', color: 'Café', clientId: pedro, ...patch,
  });

  beforeAll(async () => {
    recep = await tokenFor(USERS.receptionist);
    pedro = await clientIdByIdentification('1105017030');
    labrador = await speciesAndBreed('Canino', 'Labrador Retriever');
  });

  it('CP-07-01 registra un paciente Activo con código PAC-###### asociado a Pedro Castillo', async () => {
    const response = await api().post('/pets').set(bearer(recep)).send(body());
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Paciente registrado exitosamente');
    expect(response.body.data).toMatchObject({ status: 'ACTIVE', clientId: pedro, birthDate: '10-02-2024' });
    expect(response.body.data.code).toMatch(/^PAC-\d{6}$/);
  });

  it('CP-07-02 rechaza los obligatorios vacíos', async () => {
    const response = await api().post('/pets').set(bearer(recep)).send(body({ name: '', weightKg: '' }));
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Por favor, complete todos los campos obligatorios');
  });

  it('CP-07-03 registra sin color', async () => {
    const response = await api().post('/pets').set(bearer(recep)).send(body({ name: 'Sin Color', color: '' }));
    expect(response.status).toBe(201);
    expect(response.body.data.color).toBeNull();
  });

  it('CP-07-04 exige un cliente', async () => {
    const { clientId: _omit, ...withoutClient } = body();
    const response = await api().post('/pets').set(bearer(recep)).send(withoutClient);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Debe seleccionar un cliente registrado');
  });

  it.each([['dado de baja (Hugo Vivanco)', '1105018145'], ['inactivo (Rosa Jaramillo)', '1105017774']])(
    'CP-07-05/06 rechaza un cliente %s',
    async (_, identification) => {
      const clientId = await clientIdByIdentification(identification);
      const response = await api().post('/pets').set(bearer(recep)).send(body({ clientId }));
      expect(response.status).toBe(409);
      expect(response.body.message).toBe('El cliente seleccionado no está disponible');
    },
  );

  it.each([['inexistente', '31-02-2024'], ['futura', '01-01-2099']])('CP-07-07/08 rechaza una fecha %s', async (_, birthDate) => {
    const response = await api().post('/pets').set(bearer(recep)).send(body({ birthDate }));
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Fecha de nacimiento inválida');
  });

  it('CP-07-10 acepta la fecha de nacimiento de hoy (valor límite)', async () => {
    const response = await api().post('/pets').set(bearer(recep)).send(body({ name: 'Recién Nacido', birthDate: todayClinic() }));
    expect(response.status).toBe(201);
  });

  it('CP-07-12 rechaza peso cero (valor límite)', async () => {
    const response = await api().post('/pets').set(bearer(recep)).send(body({ weightKg: 0 }));
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('El peso y la talla deben ser valores numéricos mayores que cero');
  });

  it.each([[0.01], [9999.99]])('CP-07-14 acepta el peso %s (valor límite)', async (weightKg) => {
    const response = await api().post('/pets').set(bearer(recep)).send(body({ name: `Peso ${weightKg}`, weightKg }));
    expect(response.status).toBe(201);
    expect(response.body.data.weightKg).toBe(weightKg);
  });

  it('CP-07-16 genera códigos únicos e ignora el código enviado', async () => {
    const first = await api().post('/pets').set(bearer(recep)).send(body({ name: 'Código A' }));
    const second = await api().post('/pets').set(bearer(recep)).send(body({ name: 'Código B', code: 'PAC-999999' }));
    expect(second.status).toBe(201);
    expect(second.body.data.code).not.toBe('PAC-999999');
    expect(second.body.data.code).not.toBe(first.body.data.code);
  });

  it('CP-07-17 rechaza una raza que no corresponde a la especie', async () => {
    const felino = await speciesAndBreed('Felino');
    const response = await api().post('/pets').set(bearer(recep)).send(body({ speciesId: felino.speciesId }));
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('La raza no corresponde a la especie seleccionada');
  });

  it('CP-07-18 rechaza una especie inactiva (Hurón)', async () => {
    const huron = await speciesAndBreed('Hurón');
    const response = await api().post('/pets').set(bearer(recep)).send(body({ speciesId: huron.speciesId }));
    expect(response.status).toBe(409);
    expect(response.body.message).toBe('La especie seleccionada no está disponible');
  });

  it.each([['Cajero', USERS.cashier], ['Técnico Veterinario', USERS.technician]])('CP-07-19 niega el registro al %s', async (_, email) => {
    const token = await tokenFor(email);
    const response = await api().post('/pets').set(bearer(token)).send(body());
    expect(response.status).toBe(403);
  });
});

describe('HU-13 Registrar especie (API)', () => {
  let vet: string;
  beforeAll(async () => {
    vet = await tokenFor(USERS.veterinarian);
  });

  it('CP-13-01 registra una especie con descripción', async () => {
    const response = await api().post('/pets/species').set(bearer(vet)).send({ name: 'Roedor', description: 'Hámsters, cobayos y similares' });
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Especie registrada exitosamente');
    expect(response.body.data.isActive).toBe(true);
  });

  it('CP-13-02 rechaza el nombre vacío', async () => {
    const response = await api().post('/pets/species').set(bearer(vet)).send({ name: '' });
    expect(response.status).toBe(400);
    expect(String(response.body.message)).toContain('El nombre de la especie es obligatorio');
  });

  it('CP-13-04 registra sin descripción', async () => {
    const response = await api().post('/pets/species').set(bearer(vet)).send({ name: 'Pez' });
    expect(response.status).toBe(201);
    expect(response.body.data.description ?? null).toBeNull();
  });

  it.each([['Canino'], ['canino']])('CP-13-06 rechaza el nombre duplicado "%s"', async (name) => {
    const response = await api().post('/pets/species').set(bearer(vet)).send({ name });
    expect(response.status).toBe(409);
  });

  it('CP-13-07 acepta 100 caracteres y rechaza 101 (valor límite)', async () => {
    expect((await api().post('/pets/species').set(bearer(vet)).send({ name: 'E'.repeat(100) })).status).toBe(201);
    const tooLong = await api().post('/pets/species').set(bearer(vet)).send({ name: 'F'.repeat(101) });
    expect(tooLong.status).toBe(400);
    expect(String(tooLong.body.message)).toContain('El nombre no puede exceder los 100 caracteres');
  });

  it('CP-13-08 niega el registro al Recepcionista', async () => {
    const token = await tokenFor(USERS.receptionist);
    const response = await api().post('/pets/species').set(bearer(token)).send({ name: 'Anfibio' });
    expect(response.status).toBe(403);
  });

  it('CP-13-09 niega el registro al Administrador (matriz de roles: solo Veterinario)', async () => {
    const token = await tokenFor(USERS.admin);
    const response = await api().post('/pets/species').set(bearer(token)).send({ name: 'Insecto' });
    expect(response.status).toBe(403);
    const [{ total }] = await sql<{ total: string }>("SELECT count(*) AS total FROM species WHERE name = 'Insecto'");
    expect(total).toBe('0');
  });
});
