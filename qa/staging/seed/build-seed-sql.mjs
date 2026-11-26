// Genera qa-seed.sql a partir de qa-seed.data.json.
// Uso: node qa/staging/seed/build-seed-sql.mjs
// El hash de la contraseña usa el mismo formato que la API (scrypt$N$r$p$sal$hash).
import { randomBytes, scryptSync } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(join(here, 'qa-seed.data.json'), 'utf8'));

function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return ['scrypt', 16384, 8, 1, salt.toString('base64'), derived.toString('base64')].join('$');
}

const q = (value) => (value === null || value === undefined ? 'NULL' : `'${String(value).replace(/'/g, "''")}'`);
const hash = hashPassword(data.password);
const lines = [];
const out = (line = '') => lines.push(line);

out('-- Datos semilla QA – Sprint 1 (VetManage, Módulo 1).');
out('-- GENERADO por build-seed-sql.mjs desde qa-seed.data.json. No editar a mano.');
out(`-- Contraseña común de las cuentas QA: ${data.password}`);
out('-- Requiere: migraciones aplicadas, roles creados por la API al arrancar y el seed de la app (especies/razas).');
out('BEGIN;');
out();

out('-- 1. Personas y cuentas del personal (8 roles + casos especiales)');
for (const user of data.users) {
  out(`-- ${user.purpose}`);
  out(`INSERT INTO persons (id, identification, first_name, last_name, email, phone, created_at, updated_at)
VALUES (gen_random_uuid(), ${q(user.identification)}, ${q(user.firstName)}, ${q(user.lastName)}, ${q(user.email)}, ${q(user.phone)}, NOW(), NOW())
ON CONFLICT (identification) DO NOTHING;`);
  out(`INSERT INTO users (id, person_id, password, status, must_change_password, deactivated_at, created_at, updated_at)
SELECT gen_random_uuid(), p.id, ${q(hash)}, '${user.status ?? 'ACTIVE'}', ${user.mustChangePassword ? 'TRUE' : 'FALSE'}, ${user.status === 'DEACTIVATED' ? 'NOW()' : 'NULL'}, NOW(), NOW()
FROM persons p WHERE p.identification = ${q(user.identification)}
ON CONFLICT (person_id) DO NOTHING;`);
  for (const role of user.roles) {
    out(`INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at)
SELECT gen_random_uuid(), u.id, r.id, NOW(), NOW()
FROM users u JOIN persons p ON p.id = u.person_id JOIN roles r ON r.name = ${q(role)}
WHERE p.identification = ${q(user.identification)}
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);`);
  }
  if (user.client) {
    out(`INSERT INTO clients (id, person_id, status, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '${user.client}', NOW(), NOW() FROM persons p WHERE p.identification = ${q(user.identification)}
ON CONFLICT (person_id) DO NOTHING;`);
  }
  out();
}

out('-- 2. Clientes');
for (const client of data.clients) {
  out(`-- ${client.purpose}`);
  out(`INSERT INTO persons (id, identification, first_name, last_name, email, phone, address, created_at, updated_at)
VALUES (gen_random_uuid(), ${q(client.identification)}, ${q(client.firstName)}, ${q(client.lastName)}, ${q(client.email)}, ${q(client.phone)}, ${q(client.address)}, NOW(), NOW())
ON CONFLICT (identification) DO NOTHING;`);
  out(`INSERT INTO clients (id, person_id, status, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '${client.status}', NOW(), NOW() FROM persons p WHERE p.identification = ${q(client.identification)}
ON CONFLICT (person_id) DO NOTHING;`);
  {
    // Igual que HU-01: todo cliente tiene una cuenta con el rol Cliente (el listado de clientes depende de ella).
    out(`INSERT INTO users (id, person_id, password, status, must_change_password, created_at, updated_at)
SELECT gen_random_uuid(), p.id, ${q(hash)}, 'ACTIVE', TRUE, NOW(), NOW() FROM persons p WHERE p.identification = ${q(client.identification)}
ON CONFLICT (person_id) DO NOTHING;`);
    out(`INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at)
SELECT gen_random_uuid(), u.id, r.id, NOW(), NOW()
FROM users u JOIN persons p ON p.id = u.person_id JOIN roles r ON r.name = 'client'
WHERE p.identification = ${q(client.identification)}
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);`);
  }
  out();
}

out('-- 3. Especies adicionales');
for (const species of data.species) {
  out(`-- ${species.purpose}`);
  out(`INSERT INTO species (id, name, description, is_active, created_at, updated_at)
VALUES (gen_random_uuid(), ${q(species.name)}, ${q(species.description)}, ${species.isActive ? 'TRUE' : 'FALSE'}, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;`);
}
out();

out('-- 4. Pacientes');
for (const pet of data.pets) {
  const owner = data.clients.find((client) => client.key === pet.client);
  out(`INSERT INTO patients (id, name, gender, birth_date, weight_kg, height_cm, reproductive_status, color, status, client_id, species_id, breed_id, created_at, updated_at)
SELECT gen_random_uuid(), ${q(pet.name)}, '${pet.sex}', DATE ${q(pet.birthDate)}, ${pet.weightKg}, ${pet.heightCm}, '${pet.reproductiveStatus}', ${q(pet.color)}, ${q(pet.status ?? 'ACTIVE')}, c.id, s.id, b.id, NOW(), NOW()
FROM clients c JOIN persons p ON p.id = c.person_id
JOIN species s ON s.name = ${q(pet.species)}
JOIN breeds b ON b.species_id = s.id AND b.name = ${q(pet.breed)}
WHERE p.identification = ${q(owner.identification)}
  AND NOT EXISTS (SELECT 1 FROM patients x WHERE x.client_id = c.id AND x.name = ${q(pet.name)});`);
}
out();
out('COMMIT;');
out();

writeFileSync(join(here, 'qa-seed.sql'), lines.join('\n'), 'utf8');
console.log(`qa-seed.sql generado: ${data.users.length} usuarios, ${data.clients.length} clientes, ${data.pets.length} pacientes.`);
