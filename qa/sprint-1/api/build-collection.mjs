// Genera la colección Postman (v2.1) que ejecuta Newman contra Staging.
// Uso (desde qa/): node sprint-1/api/build-collection.mjs  → vetmanage-sprint1.postman_collection.json
// La colección también se puede importar en Postman para ejecución manual.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

// Fragmentos de scripts de prueba (sintaxis de Postman).
const status = (code) => `pm.test('HTTP ${code}', () => pm.response.to.have.status(${code}));`;
const message = (text) => `pm.test('Mensaje: ${text.replace(/'/g, "\\'")}', () => pm.expect(pm.response.json().message).to.eql('${text.replace(/'/g, "\\'")}'));`;
const save = (variable, path) => `pm.collectionVariables.set('${variable}', pm.response.json().${path});`;

function request(name, { method = 'GET', path, token, body, tests = [] }) {
  return {
    name,
    event: [{ listen: 'test', script: { type: 'text/javascript', exec: tests } }],
    request: {
      method,
      header: [
        { key: 'Content-Type', value: 'application/json' },
        ...(token ? [{ key: 'Authorization', value: `Bearer {{${token}}}` }] : []),
      ],
      ...(body ? { body: { mode: 'raw', raw: JSON.stringify(body, null, 2) } } : {}),
      url: { raw: `{{baseUrl}}${path}`, host: ['{{baseUrl}}'], path: path.replace(/^\//, '').split('?')[0].split('/'),
        ...(path.includes('?') ? { query: path.split('?')[1].split('&').map((kv) => { const [key, value] = kv.split('='); return { key, value }; }) } : {}) },
    },
  };
}

const login = (name, email, variable) => request(name, {
  method: 'POST', path: '/auth/login', body: { email, password: '{{password}}' },
  tests: [status(200), save(variable, 'data.accessToken')],
});

const pet = (patch = {}) => ({
  name: 'Newman', speciesId: '{{caninoId}}', breedId: '{{labradorId}}', sex: 'FEMALE', birthDate: '05-06-2023',
  weightKg: 7.5, heightCm: 35, reproductiveStatus: 'STERILIZED', color: 'Blanco', clientId: '{{pedroId}}', ...patch,
});

const folders = [
  { name: '00 · Preparación (tokens e IDs de la semilla)', item: [
    login('Login Administrador', 'qa.admin@vetmanage.test', 'adminToken'),
    login('Login Recepcionista', 'qa.recepcion@vetmanage.test', 'recepToken'),
    login('Login Veterinario', 'qa.veterinario@vetmanage.test', 'vetToken'),
    request('Buscar a Carlos Pérez', { path: '/users?q=1105013336', token: 'adminToken', tests: [status(200), save('carlosId', 'data.items[0].id')] }),
    request('Buscar a Pedro Castillo (cliente)', { path: '/clients?search=1105017030', token: 'recepToken', tests: [status(200), save('pedroId', 'data.items[0].id')] }),
    request('Especies activas', { path: '/pets/species/active', token: 'recepToken', tests: [status(200),
      "pm.collectionVariables.set('caninoId', pm.response.json().data.find((s) => s.name === 'Canino').id);"] }),
    request('Razas de Canino', { path: '/pets/species/{{caninoId}}/breeds', token: 'recepToken', tests: [status(200),
      "pm.collectionVariables.set('labradorId', pm.response.json().data.find((b) => b.name === 'Labrador Retriever').id);"] }),
  ] },
  { name: 'HU-57 · Iniciar sesión', item: [
    request('CP-57-01 Login correcto', { method: 'POST', path: '/auth/login', body: { email: 'qa.gerente@vetmanage.test', password: '{{password}}' },
      tests: [status(200), "pm.test('Entrega accessToken', () => pm.expect(pm.response.json().data.accessToken).to.be.a('string'));",
        "pm.test('Responde en menos de 2 s', () => pm.expect(pm.response.responseTime).to.be.below(2000));"] }),
    request('CP-57-03 Contraseña incorrecta', { method: 'POST', path: '/auth/login', body: { email: 'qa.gerente@vetmanage.test', password: 'Mala1234' },
      tests: [status(401), "pm.test('Mensaje genérico', () => pm.expect(pm.response.json().message).to.match(/^Correo o contraseña incorrectos/));"] }),
    request('CP-57-04 Campos vacíos', { method: 'POST', path: '/auth/login', body: { email: '', password: '' },
      tests: [status(400), message('Ingrese su correo y contraseña')] }),
    request('CP-57-08 Cuenta inactiva', { method: 'POST', path: '/auth/login', body: { email: 'qa.inactivo@vetmanage.test', password: '{{password}}' },
      tests: [status(403), message('Su cuenta se encuentra desactivada. Contacte al administrador')] }),
  ] },
  { name: 'HU-51 · Registrar usuario', item: [
    request('CP-51-01 Registrar Veterinario', { method: 'POST', path: '/users', token: 'adminToken',
      body: { identification: '1105018517', firstName: 'Pablo', lastName: 'Andrade', email: 'pablo.andrade@vetmanage.test', phone: '0991234567', roles: ['veterinarian'] },
      tests: [status(201), message('Usuario registrado correctamente'),
        "pm.test('Cuenta ACTIVE', () => pm.expect(pm.response.json().data.status).to.eql('ACTIVE'));"] }),
    request('CP-51-07 Cédula del personal repetida', { method: 'POST', path: '/users', token: 'adminToken',
      body: { identification: '1105010746', firstName: 'X', lastName: 'Y', email: 'repetida@vetmanage.test', roles: ['cashier'] },
      tests: [status(409), message('Número de cédula ya registrado')] }),
    request('CP-51-11 Correo repetido', { method: 'POST', path: '/users', token: 'adminToken',
      body: { identification: '1105019259', firstName: 'X', lastName: 'Y', email: 'mlopez@vetmanage.com', roles: ['cashier'] },
      tests: [status(409), message('El correo ya se encuentra registrado')] }),
    request('CP-51-14 Recepcionista sin permiso', { method: 'POST', path: '/users', token: 'recepToken',
      body: { identification: '1105019259', firstName: 'X', lastName: 'Y', email: 'x@vetmanage.test', roles: ['cashier'] },
      tests: [status(403), message('No tiene permisos para realizar esta acción')] }),
  ] },
  { name: 'HU-54 · Asignar y quitar roles', item: [
    request('CP-54-07 Roles disponibles sin el ya asignado', { path: '/users/{{carlosId}}/role-assignment', token: 'adminToken',
      tests: [status(200), "pm.test('Recepcionista no es opción', () => pm.expect(pm.response.json().data.availableRoles.map((r) => r.name)).to.not.include('receptionist'));"] }),
    request('CP-54-01 Asignar Cajero', { method: 'PUT', path: '/users/{{carlosId}}/role-assignment', token: 'adminToken', body: { roles: ['receptionist', 'cashier'] },
      tests: [status(200), message('Roles actualizados correctamente'),
        "pm.test('Queda con 2 roles', () => pm.expect(pm.response.json().data.currentRoles.length).to.eql(2));"] }),
    request('CP-54-04 Quitar todos los roles', { method: 'PUT', path: '/users/{{carlosId}}/role-assignment', token: 'adminToken', body: { roles: [] },
      tests: [status(400), message('El usuario debe tener al menos un rol')] }),
    request('CP-54-09 Veterinario sin permiso', { method: 'PUT', path: '/users/{{carlosId}}/role-assignment', token: 'vetToken', body: { roles: ['cashier'] },
      tests: [status(403)] }),
  ] },
  { name: 'HU-01 · Registrar cliente', item: [
    request('CP-01-01 Registrar cliente válido', { method: 'POST', path: '/clients', token: 'recepToken',
      body: { identification: '1105019994', firstName: 'Mateo', lastName: 'Cueva', email: 'mateo.cueva@correo.test', phone: '0987654321', address: 'Av. Orillas del Zamora' },
      tests: [status(201), message('Cliente registrado exitosamente')] }),
    request('CP-01-06 Cédula de cliente existente', { method: 'POST', path: '/clients', token: 'recepToken',
      body: { identification: '1105017030', firstName: 'Otro', lastName: 'Cliente', email: 'otro.pedro@correo.test', phone: '0987654321' },
      tests: [status(409), message('Número de cédula ya registrado')] }),
    request('CP-01-07 Cédula alfanumérica', { method: 'POST', path: '/clients', token: 'recepToken',
      body: { identification: '11050A0001', firstName: 'X', lastName: 'Y', email: 'x@correo.test', phone: '0987654321' },
      tests: [status(400), message('Número de cédula no válido')] }),
    request('CP-01-14 Cajero sin permiso', { method: 'POST', path: '/clients', token: 'recepToken',
      tests: ["// Se usa el token del Cajero obtenido en la petición previa", status(403)] }),
  ] },
  { name: 'HU-07 · Registrar paciente', item: [
    request('CP-07-01 Registrar paciente válido', { method: 'POST', path: '/pets', token: 'recepToken', body: pet(),
      tests: [status(201), message('Paciente registrado exitosamente'),
        "pm.test('Código PAC-######', () => pm.expect(pm.response.json().data.code).to.match(/^PAC-\\d{6}$/));"] }),
    request('CP-07-04 Sin cliente', { method: 'POST', path: '/pets', token: 'recepToken', body: pet({ clientId: '' }),
      tests: [status(400), message('Debe seleccionar un cliente registrado')] }),
    request('CP-07-12 Peso cero', { method: 'POST', path: '/pets', token: 'recepToken', body: pet({ weightKg: 0 }),
      tests: [status(400), message('El peso y la talla deben ser valores numéricos mayores que cero')] }),
  ] },
  { name: 'HU-13 · Registrar especie', item: [
    request('CP-13-01 Registrar especie', { method: 'POST', path: '/pets/species', token: 'vetToken', body: { name: 'Quelonio', description: 'Tortugas' },
      tests: [status(201), message('Especie registrada exitosamente')] }),
    request('CP-13-02 Nombre vacío', { method: 'POST', path: '/pets/species', token: 'vetToken', body: { name: '' }, tests: [status(400)] }),
    request('CP-13-08 Recepcionista sin permiso', { method: 'POST', path: '/pets/species', token: 'recepToken', body: { name: 'Anfibio' }, tests: [status(403)] }),
  ] },
];

// CP-01-14 necesita el token del Cajero: se agrega su login antes de la petición.
const hu01 = folders.find((f) => f.name.startsWith('HU-01'));
const cashierIndex = hu01.item.findIndex((i) => i.name.startsWith('CP-01-14'));
hu01.item.splice(cashierIndex, 1,
  login('Login Cajero', 'qa.cajero@vetmanage.test', 'cashierToken'),
  request('CP-01-14 Cajero sin permiso', { method: 'POST', path: '/clients', token: 'cashierToken',
    body: { identification: '1105032872', firstName: 'X', lastName: 'Y', email: 'denegado@correo.test', phone: '0987654321' },
    tests: [status(403), message('No tiene permisos para realizar esta acción')] }));

const collection = {
  info: {
    name: 'VetManage – QA Sprint 1 (HU-51, HU-54, HU-57, HU-01, HU-07, HU-13)',
    description: 'Regresión de API del Sprint 1. Ejecutar con Newman contra Staging restaurado desde la semilla QA. Generado por build-collection.mjs.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  item: folders,
  variable: ['adminToken', 'recepToken', 'vetToken', 'cashierToken', 'carlosId', 'pedroId', 'caninoId', 'labradorId'].map((key) => ({ key, value: '' })),
};

const environment = {
  name: 'VetManage Staging (QA)',
  values: [
    { key: 'baseUrl', value: 'http://localhost:3180/api/v1', enabled: true },
    { key: 'password', value: 'QaVet2026', enabled: true },
  ],
};

writeFileSync(join(here, 'vetmanage-sprint1.postman_collection.json'), JSON.stringify(collection, null, 2));
writeFileSync(join(here, 'staging.postman_environment.json'), JSON.stringify(environment, null, 2));
const total = folders.reduce((n, f) => n + f.item.length, 0);
console.log(`Colección generada: ${folders.length} carpetas, ${total} peticiones.`);
