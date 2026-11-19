// Utilidades de la suite de integración API (Supertest contra Staging).
import pg from 'pg';
import request from 'supertest';

export const API_URL = process.env.QA_API_URL ?? 'http://localhost:3180/api/v1';
export const MAILPIT_URL = process.env.QA_MAILPIT_URL ?? 'http://localhost:59025';
export const DATABASE_URL =
  process.env.QA_DATABASE_URL ?? 'postgresql://vetmanage:vetmanage_staging_password@localhost:56432/vet_manage_staging';
export const PASSWORD = 'QaVet2026';

// Cuentas de la semilla QA (ver docs/modulo-1-historial-clinico/pruebas/sprint-1/02-datos-semilla.md).
export const USERS = {
  admin: 'qa.admin@vetmanage.test',
  manager: 'qa.gerente@vetmanage.test',
  veterinarian: 'qa.veterinario@vetmanage.test',
  technician: 'qa.tecnico@vetmanage.test',
  receptionist: 'qa.recepcion@vetmanage.test',
  cashier: 'qa.cajero@vetmanage.test',
  warehouse: 'qa.bodeguero@vetmanage.test',
  client: 'qa.cliente@vetmanage.test',
  multiRole: 'qa.multirol@vetmanage.test',
  carlos: 'qa.cperez@vetmanage.test',
  luis: 'qa.lrios@vetmanage.test',
  inactive: 'qa.inactivo@vetmanage.test',
  temporary: 'qa.temporal@vetmanage.test',
  counter: 'qa.contador@vetmanage.test',
  lockoutApi: 'qa.bloqueo.api@vetmanage.test',
  roleTarget: 'qa.rotacion@vetmanage.test',
} as const;

export const api = () => request(API_URL);
export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

const tokens = new Map<string, string>();
export async function tokenFor(email: string, { fresh = false } = {}): Promise<string> {
  if (!fresh && tokens.has(email)) return tokens.get(email)!;
  const response = await api().post('/auth/login').send({ email, password: PASSWORD });
  if (response.status !== 200) {
    throw new Error(`No se pudo iniciar sesión con ${email}: ${response.status} ${JSON.stringify(response.body)}`);
  }
  tokens.set(email, response.body.data.accessToken);
  return response.body.data.accessToken;
}

// Consultas SQL directas para verificar el estado en la base (plan: "consultas SQL").
let pool: pg.Pool | undefined;
export async function sql<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  pool ??= new pg.Pool({ connectionString: DATABASE_URL, max: 2 });
  return (await pool.query(text, params)).rows as T[];
}
export async function closeDb() {
  await pool?.end();
  pool = undefined;
}

export async function userIdByEmail(email: string): Promise<string> {
  const [row] = await sql<{ id: string }>(
    'SELECT u.id FROM users u JOIN persons p ON p.id = u.person_id WHERE lower(p.email) = lower($1)', [email]);
  if (!row) throw new Error(`No existe el usuario ${email} en la semilla`);
  return row.id;
}

export async function clientIdByIdentification(identification: string): Promise<string> {
  const [row] = await sql<{ id: string }>(
    'SELECT c.id FROM clients c JOIN persons p ON p.id = c.person_id WHERE p.identification = $1', [identification]);
  if (!row) throw new Error(`No existe el cliente ${identification} en la semilla`);
  return row.id;
}

export async function speciesAndBreed(species: string, breed?: string) {
  const [row] = await sql<{ species_id: string; breed_id: string | null }>(
    `SELECT s.id AS species_id, b.id AS breed_id FROM species s
     LEFT JOIN breeds b ON b.species_id = s.id AND b.name = $2
     WHERE s.name = $1`, [species, breed ?? null]);
  if (!row) throw new Error(`No existe la especie ${species}`);
  return { speciesId: row.species_id, breedId: row.breed_id };
}

// Tablas de auditoría que exige OC-04 / PNF-05 (cualquier tabla cuyo nombre contenga "audit").
export async function auditTables(): Promise<string[]> {
  const rows = await sql<{ table_name: string }>(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name ILIKE '%audit%'");
  return rows.map((r) => r.table_name);
}

export async function mailsTo(address: string): Promise<number> {
  const response = await fetch(`${MAILPIT_URL}/api/v1/search?query=${encodeURIComponent(`to:"${address}"`)}`);
  if (!response.ok) throw new Error(`Mailpit respondió ${response.status}`);
  return (await response.json()).messages_count as number;
}

// JWT con la firma alterada (último carácter cambiado).
export const tamper = (jwt: string) => jwt.slice(0, -2) + (jwt.endsWith('AA') ? 'BB' : 'AA');

export const todayClinic = () => {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Guayaquil', day: '2-digit', month: '2-digit', year: 'numeric' })
    .format(new Date()).split('/');
  return `${parts[0]}-${parts[1]}-${parts[2]}`;
};
