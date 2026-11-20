-- Datos semilla QA – Sprint 1 (VetManage, Módulo 1).
-- GENERADO por build-seed-sql.mjs desde qa-seed.data.json. No editar a mano.
-- Contraseña común de las cuentas QA: QaVet2026
-- Requiere: migraciones aplicadas, roles creados por la API al arrancar y el seed de la app (especies/razas).
BEGIN;

-- 1. Personas y cuentas del personal (8 roles + casos especiales)
-- Rol 1/8 Administrador: registra usuarios (HU-51) y asigna roles (HU-54).
INSERT INTO persons (id, identification, first_name, last_name, email, phone, created_at, updated_at)
VALUES (gen_random_uuid(), '1105010001', 'Andrea', 'Administradora QA', 'qa.admin@vetmanage.test', '0991100001', NOW(), NOW())
ON CONFLICT (identification) DO NOTHING;
INSERT INTO users (id, person_id, password, status, must_change_password, deactivated_at, created_at, updated_at)
SELECT gen_random_uuid(), p.id, 'scrypt$16384$8$1$kOVJ3afrAbUHav/DgixwDg==$ozB1K40J2wHhWVVD3uuhXo8AiYNCd02LnI4Vg+uRs4cYLBVXNJaPOhW7rATbmid0/2aMvHPxxCKFkxu2Mj7feA==', 'ACTIVE', FALSE, NULL, NOW(), NOW()
FROM persons p WHERE p.identification = '1105010001'
ON CONFLICT (person_id) DO NOTHING;
INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at)
SELECT gen_random_uuid(), u.id, r.id, NOW(), NOW()
FROM users u JOIN persons p ON p.id = u.person_id JOIN roles r ON r.name = 'administrator'
WHERE p.identification = '1105010001'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- Rol 2/8 Gerente: registra clientes (HU-01) y pacientes (HU-07).
INSERT INTO persons (id, identification, first_name, last_name, email, phone, created_at, updated_at)
VALUES (gen_random_uuid(), '1105010373', 'Gabriel', 'Gerente QA', 'qa.gerente@vetmanage.test', '0991100002', NOW(), NOW())
ON CONFLICT (identification) DO NOTHING;
INSERT INTO users (id, person_id, password, status, must_change_password, deactivated_at, created_at, updated_at)
SELECT gen_random_uuid(), p.id, 'scrypt$16384$8$1$kOVJ3afrAbUHav/DgixwDg==$ozB1K40J2wHhWVVD3uuhXo8AiYNCd02LnI4Vg+uRs4cYLBVXNJaPOhW7rATbmid0/2aMvHPxxCKFkxu2Mj7feA==', 'ACTIVE', FALSE, NULL, NOW(), NOW()
FROM persons p WHERE p.identification = '1105010373'
ON CONFLICT (person_id) DO NOTHING;
INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at)
SELECT gen_random_uuid(), u.id, r.id, NOW(), NOW()
FROM users u JOIN persons p ON p.id = u.person_id JOIN roles r ON r.name = 'manager'
WHERE p.identification = '1105010373'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- Rol 3/8 Veterinario: registra especies (HU-13), clientes (HU-01); sin permiso para roles (HU-54 Esc. 8).
INSERT INTO persons (id, identification, first_name, last_name, email, phone, created_at, updated_at)
VALUES (gen_random_uuid(), '1105010746', 'Valeria', 'Veterinaria QA', 'qa.veterinario@vetmanage.test', '0991100003', NOW(), NOW())
ON CONFLICT (identification) DO NOTHING;
INSERT INTO users (id, person_id, password, status, must_change_password, deactivated_at, created_at, updated_at)
SELECT gen_random_uuid(), p.id, 'scrypt$16384$8$1$kOVJ3afrAbUHav/DgixwDg==$ozB1K40J2wHhWVVD3uuhXo8AiYNCd02LnI4Vg+uRs4cYLBVXNJaPOhW7rATbmid0/2aMvHPxxCKFkxu2Mj7feA==', 'ACTIVE', FALSE, NULL, NOW(), NOW()
FROM persons p WHERE p.identification = '1105010746'
ON CONFLICT (person_id) DO NOTHING;
INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at)
SELECT gen_random_uuid(), u.id, r.id, NOW(), NOW()
FROM users u JOIN persons p ON p.id = u.person_id JOIN roles r ON r.name = 'veterinarian'
WHERE p.identification = '1105010746'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- Rol 4/8 Técnico Veterinario: solo consulta clientes/pacientes; pruebas negativas de permisos.
INSERT INTO persons (id, identification, first_name, last_name, email, phone, created_at, updated_at)
VALUES (gen_random_uuid(), '1105011116', 'Tomás', 'Técnico QA', 'qa.tecnico@vetmanage.test', '0991100004', NOW(), NOW())
ON CONFLICT (identification) DO NOTHING;
INSERT INTO users (id, person_id, password, status, must_change_password, deactivated_at, created_at, updated_at)
SELECT gen_random_uuid(), p.id, 'scrypt$16384$8$1$kOVJ3afrAbUHav/DgixwDg==$ozB1K40J2wHhWVVD3uuhXo8AiYNCd02LnI4Vg+uRs4cYLBVXNJaPOhW7rATbmid0/2aMvHPxxCKFkxu2Mj7feA==', 'ACTIVE', FALSE, NULL, NOW(), NOW()
FROM persons p WHERE p.identification = '1105011116'
ON CONFLICT (person_id) DO NOTHING;
INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at)
SELECT gen_random_uuid(), u.id, r.id, NOW(), NOW()
FROM users u JOIN persons p ON p.id = u.person_id JOIN roles r ON r.name = 'veterinary_technician'
WHERE p.identification = '1105011116'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- Rol 5/8 Recepcionista: registra clientes y pacientes; sin permiso para registrar usuarios (HU-51 Esc. 9).
INSERT INTO persons (id, identification, first_name, last_name, email, phone, created_at, updated_at)
VALUES (gen_random_uuid(), '1105011488', 'Rebeca', 'Recepcionista QA', 'qa.recepcion@vetmanage.test', '0991100005', NOW(), NOW())
ON CONFLICT (identification) DO NOTHING;
INSERT INTO users (id, person_id, password, status, must_change_password, deactivated_at, created_at, updated_at)
SELECT gen_random_uuid(), p.id, 'scrypt$16384$8$1$kOVJ3afrAbUHav/DgixwDg==$ozB1K40J2wHhWVVD3uuhXo8AiYNCd02LnI4Vg+uRs4cYLBVXNJaPOhW7rATbmid0/2aMvHPxxCKFkxu2Mj7feA==', 'ACTIVE', FALSE, NULL, NOW(), NOW()
FROM persons p WHERE p.identification = '1105011488'
ON CONFLICT (person_id) DO NOTHING;
INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at)
SELECT gen_random_uuid(), u.id, r.id, NOW(), NOW()
FROM users u JOIN persons p ON p.id = u.person_id JOIN roles r ON r.name = 'receptionist'
WHERE p.identification = '1105011488'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- Rol 6/8 Cajero: sin permisos del Módulo 1; pruebas de confidencialidad (PNF-01).
INSERT INTO persons (id, identification, first_name, last_name, email, phone, created_at, updated_at)
VALUES (gen_random_uuid(), '1105011850', 'Camilo', 'Cajero QA', 'qa.cajero@vetmanage.test', '0991100006', NOW(), NOW())
ON CONFLICT (identification) DO NOTHING;
INSERT INTO users (id, person_id, password, status, must_change_password, deactivated_at, created_at, updated_at)
SELECT gen_random_uuid(), p.id, 'scrypt$16384$8$1$kOVJ3afrAbUHav/DgixwDg==$ozB1K40J2wHhWVVD3uuhXo8AiYNCd02LnI4Vg+uRs4cYLBVXNJaPOhW7rATbmid0/2aMvHPxxCKFkxu2Mj7feA==', 'ACTIVE', FALSE, NULL, NOW(), NOW()
FROM persons p WHERE p.identification = '1105011850'
ON CONFLICT (person_id) DO NOTHING;
INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at)
SELECT gen_random_uuid(), u.id, r.id, NOW(), NOW()
FROM users u JOIN persons p ON p.id = u.person_id JOIN roles r ON r.name = 'cashier'
WHERE p.identification = '1105011850'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- Rol 7/8 Bodeguero: sin permisos del Módulo 1; pruebas de confidencialidad (PNF-01).
INSERT INTO persons (id, identification, first_name, last_name, email, phone, created_at, updated_at)
VALUES (gen_random_uuid(), '1105012221', 'Bruno', 'Bodeguero QA', 'qa.bodeguero@vetmanage.test', '0991100007', NOW(), NOW())
ON CONFLICT (identification) DO NOTHING;
INSERT INTO users (id, person_id, password, status, must_change_password, deactivated_at, created_at, updated_at)
SELECT gen_random_uuid(), p.id, 'scrypt$16384$8$1$kOVJ3afrAbUHav/DgixwDg==$ozB1K40J2wHhWVVD3uuhXo8AiYNCd02LnI4Vg+uRs4cYLBVXNJaPOhW7rATbmid0/2aMvHPxxCKFkxu2Mj7feA==', 'ACTIVE', FALSE, NULL, NOW(), NOW()
FROM persons p WHERE p.identification = '1105012221'
ON CONFLICT (person_id) DO NOTHING;
INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at)
SELECT gen_random_uuid(), u.id, r.id, NOW(), NOW()
FROM users u JOIN persons p ON p.id = u.person_id JOIN roles r ON r.name = 'warehouse_keeper'
WHERE p.identification = '1105012221'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- Rol 8/8 Cliente: inicia sesión pero no accede a funciones del personal.
INSERT INTO persons (id, identification, first_name, last_name, email, phone, created_at, updated_at)
VALUES (gen_random_uuid(), '1105012593', 'Clara', 'Cliente QA', 'qa.cliente@vetmanage.test', '0991100008', NOW(), NOW())
ON CONFLICT (identification) DO NOTHING;
INSERT INTO users (id, person_id, password, status, must_change_password, deactivated_at, created_at, updated_at)
SELECT gen_random_uuid(), p.id, 'scrypt$16384$8$1$kOVJ3afrAbUHav/DgixwDg==$ozB1K40J2wHhWVVD3uuhXo8AiYNCd02LnI4Vg+uRs4cYLBVXNJaPOhW7rATbmid0/2aMvHPxxCKFkxu2Mj7feA==', 'ACTIVE', FALSE, NULL, NOW(), NOW()
FROM persons p WHERE p.identification = '1105012593'
ON CONFLICT (person_id) DO NOTHING;
INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at)
SELECT gen_random_uuid(), u.id, r.id, NOW(), NOW()
FROM users u JOIN persons p ON p.id = u.person_id JOIN roles r ON r.name = 'client'
WHERE p.identification = '1105012593'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);
INSERT INTO clients (id, person_id, status, created_at, updated_at)
SELECT gen_random_uuid(), p.id, 'ACTIVE', NOW(), NOW() FROM persons p WHERE p.identification = '1105012593'
ON CONFLICT (person_id) DO NOTHING;

-- HU-57 Esc. 2 (varios roles) y segundo Administrador activo para HU-54.
INSERT INTO persons (id, identification, first_name, last_name, email, phone, created_at, updated_at)
VALUES (gen_random_uuid(), '1105012965', 'Jorge', 'Solís', 'qa.multirol@vetmanage.test', '0991100009', NOW(), NOW())
ON CONFLICT (identification) DO NOTHING;
INSERT INTO users (id, person_id, password, status, must_change_password, deactivated_at, created_at, updated_at)
SELECT gen_random_uuid(), p.id, 'scrypt$16384$8$1$kOVJ3afrAbUHav/DgixwDg==$ozB1K40J2wHhWVVD3uuhXo8AiYNCd02LnI4Vg+uRs4cYLBVXNJaPOhW7rATbmid0/2aMvHPxxCKFkxu2Mj7feA==', 'ACTIVE', FALSE, NULL, NOW(), NOW()
FROM persons p WHERE p.identification = '1105012965'
ON CONFLICT (person_id) DO NOTHING;
INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at)
SELECT gen_random_uuid(), u.id, r.id, NOW(), NOW()
FROM users u JOIN persons p ON p.id = u.person_id JOIN roles r ON r.name = 'manager'
WHERE p.identification = '1105012965'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);
INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at)
SELECT gen_random_uuid(), u.id, r.id, NOW(), NOW()
FROM users u JOIN persons p ON p.id = u.person_id JOIN roles r ON r.name = 'administrator'
WHERE p.identification = '1105012965'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- HU-54 Esc. 1-4 y 6: asignar, quitar y cambiar roles.
INSERT INTO persons (id, identification, first_name, last_name, email, phone, created_at, updated_at)
VALUES (gen_random_uuid(), '1105013336', 'Carlos', 'Pérez', 'qa.cperez@vetmanage.test', '0991100010', NOW(), NOW())
ON CONFLICT (identification) DO NOTHING;
INSERT INTO users (id, person_id, password, status, must_change_password, deactivated_at, created_at, updated_at)
SELECT gen_random_uuid(), p.id, 'scrypt$16384$8$1$kOVJ3afrAbUHav/DgixwDg==$ozB1K40J2wHhWVVD3uuhXo8AiYNCd02LnI4Vg+uRs4cYLBVXNJaPOhW7rATbmid0/2aMvHPxxCKFkxu2Mj7feA==', 'ACTIVE', FALSE, NULL, NOW(), NOW()
FROM persons p WHERE p.identification = '1105013336'
ON CONFLICT (person_id) DO NOTHING;
INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at)
SELECT gen_random_uuid(), u.id, r.id, NOW(), NOW()
FROM users u JOIN persons p ON p.id = u.person_id JOIN roles r ON r.name = 'receptionist'
WHERE p.identification = '1105013336'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- HU-54 Esc. 7 (usuario dado de baja) y HU-57 Esc. 8.
INSERT INTO persons (id, identification, first_name, last_name, email, phone, created_at, updated_at)
VALUES (gen_random_uuid(), '1105013708', 'Luis', 'Ríos', 'qa.lrios@vetmanage.test', '0991100011', NOW(), NOW())
ON CONFLICT (identification) DO NOTHING;
INSERT INTO users (id, person_id, password, status, must_change_password, deactivated_at, created_at, updated_at)
SELECT gen_random_uuid(), p.id, 'scrypt$16384$8$1$kOVJ3afrAbUHav/DgixwDg==$ozB1K40J2wHhWVVD3uuhXo8AiYNCd02LnI4Vg+uRs4cYLBVXNJaPOhW7rATbmid0/2aMvHPxxCKFkxu2Mj7feA==', 'DEACTIVATED', FALSE, NOW(), NOW(), NOW()
FROM persons p WHERE p.identification = '1105013708'
ON CONFLICT (person_id) DO NOTHING;
INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at)
SELECT gen_random_uuid(), u.id, r.id, NOW(), NOW()
FROM users u JOIN persons p ON p.id = u.person_id JOIN roles r ON r.name = 'receptionist'
WHERE p.identification = '1105013708'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- HU-57 Esc. 8 (cuenta inactiva).
INSERT INTO persons (id, identification, first_name, last_name, email, phone, created_at, updated_at)
VALUES (gen_random_uuid(), '1105014078', 'Irene', 'Inactiva QA', 'qa.inactivo@vetmanage.test', '0991100012', NOW(), NOW())
ON CONFLICT (identification) DO NOTHING;
INSERT INTO users (id, person_id, password, status, must_change_password, deactivated_at, created_at, updated_at)
SELECT gen_random_uuid(), p.id, 'scrypt$16384$8$1$kOVJ3afrAbUHav/DgixwDg==$ozB1K40J2wHhWVVD3uuhXo8AiYNCd02LnI4Vg+uRs4cYLBVXNJaPOhW7rATbmid0/2aMvHPxxCKFkxu2Mj7feA==', 'INACTIVE', FALSE, NULL, NOW(), NOW()
FROM persons p WHERE p.identification = '1105014078'
ON CONFLICT (person_id) DO NOTHING;
INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at)
SELECT gen_random_uuid(), u.id, r.id, NOW(), NOW()
FROM users u JOIN persons p ON p.id = u.person_id JOIN roles r ON r.name = 'receptionist'
WHERE p.identification = '1105014078'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- HU-57 Esc. 9 (primer ingreso con contraseña temporal).
INSERT INTO persons (id, identification, first_name, last_name, email, phone, created_at, updated_at)
VALUES (gen_random_uuid(), '1105014441', 'Teresa', 'Temporal QA', 'qa.temporal@vetmanage.test', '0991100013', NOW(), NOW())
ON CONFLICT (identification) DO NOTHING;
INSERT INTO users (id, person_id, password, status, must_change_password, deactivated_at, created_at, updated_at)
SELECT gen_random_uuid(), p.id, 'scrypt$16384$8$1$kOVJ3afrAbUHav/DgixwDg==$ozB1K40J2wHhWVVD3uuhXo8AiYNCd02LnI4Vg+uRs4cYLBVXNJaPOhW7rATbmid0/2aMvHPxxCKFkxu2Mj7feA==', 'ACTIVE', TRUE, NULL, NOW(), NOW()
FROM persons p WHERE p.identification = '1105014441'
ON CONFLICT (person_id) DO NOTHING;
INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at)
SELECT gen_random_uuid(), u.id, r.id, NOW(), NOW()
FROM users u JOIN persons p ON p.id = u.person_id JOIN roles r ON r.name = 'receptionist'
WHERE p.identification = '1105014441'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- HU-57 Esc. 5-6: bloqueo al 5.º intento (E2E).
INSERT INTO persons (id, identification, first_name, last_name, email, phone, created_at, updated_at)
VALUES (gen_random_uuid(), '1105014813', 'Bernardo', 'Bloqueo QA', 'qa.bloqueo@vetmanage.test', '0991100014', NOW(), NOW())
ON CONFLICT (identification) DO NOTHING;
INSERT INTO users (id, person_id, password, status, must_change_password, deactivated_at, created_at, updated_at)
SELECT gen_random_uuid(), p.id, 'scrypt$16384$8$1$kOVJ3afrAbUHav/DgixwDg==$ozB1K40J2wHhWVVD3uuhXo8AiYNCd02LnI4Vg+uRs4cYLBVXNJaPOhW7rATbmid0/2aMvHPxxCKFkxu2Mj7feA==', 'ACTIVE', FALSE, NULL, NOW(), NOW()
FROM persons p WHERE p.identification = '1105014813'
ON CONFLICT (person_id) DO NOTHING;
INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at)
SELECT gen_random_uuid(), u.id, r.id, NOW(), NOW()
FROM users u JOIN persons p ON p.id = u.person_id JOIN roles r ON r.name = 'veterinarian'
WHERE p.identification = '1105014813'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- HU-57 Esc. 7: reinicio del contador de intentos.
INSERT INTO persons (id, identification, first_name, last_name, email, phone, created_at, updated_at)
VALUES (gen_random_uuid(), '1105015182', 'Cecilia', 'Contador QA', 'qa.contador@vetmanage.test', '0991100015', NOW(), NOW())
ON CONFLICT (identification) DO NOTHING;
INSERT INTO users (id, person_id, password, status, must_change_password, deactivated_at, created_at, updated_at)
SELECT gen_random_uuid(), p.id, 'scrypt$16384$8$1$kOVJ3afrAbUHav/DgixwDg==$ozB1K40J2wHhWVVD3uuhXo8AiYNCd02LnI4Vg+uRs4cYLBVXNJaPOhW7rATbmid0/2aMvHPxxCKFkxu2Mj7feA==', 'ACTIVE', FALSE, NULL, NOW(), NOW()
FROM persons p WHERE p.identification = '1105015182'
ON CONFLICT (person_id) DO NOTHING;
INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at)
SELECT gen_random_uuid(), u.id, r.id, NOW(), NOW()
FROM users u JOIN persons p ON p.id = u.person_id JOIN roles r ON r.name = 'veterinarian'
WHERE p.identification = '1105015182'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- HU-57 Esc. 5-6 en la suite de integración (independiente del E2E).
INSERT INTO persons (id, identification, first_name, last_name, email, phone, created_at, updated_at)
VALUES (gen_random_uuid(), '1105015554', 'Bianca', 'Bloqueo API QA', 'qa.bloqueo.api@vetmanage.test', '0991100016', NOW(), NOW())
ON CONFLICT (identification) DO NOTHING;
INSERT INTO users (id, person_id, password, status, must_change_password, deactivated_at, created_at, updated_at)
SELECT gen_random_uuid(), p.id, 'scrypt$16384$8$1$kOVJ3afrAbUHav/DgixwDg==$ozB1K40J2wHhWVVD3uuhXo8AiYNCd02LnI4Vg+uRs4cYLBVXNJaPOhW7rATbmid0/2aMvHPxxCKFkxu2Mj7feA==', 'ACTIVE', FALSE, NULL, NOW(), NOW()
FROM persons p WHERE p.identification = '1105015554'
ON CONFLICT (person_id) DO NOTHING;
INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at)
SELECT gen_random_uuid(), u.id, r.id, NOW(), NOW()
FROM users u JOIN persons p ON p.id = u.person_id JOIN roles r ON r.name = 'veterinarian'
WHERE p.identification = '1105015554'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- HU-51 Esc. 7: correo ya registrado.
INSERT INTO persons (id, identification, first_name, last_name, email, phone, created_at, updated_at)
VALUES (gen_random_uuid(), '1105015927', 'María', 'López', 'mlopez@vetmanage.com', '0991100017', NOW(), NOW())
ON CONFLICT (identification) DO NOTHING;
INSERT INTO users (id, person_id, password, status, must_change_password, deactivated_at, created_at, updated_at)
SELECT gen_random_uuid(), p.id, 'scrypt$16384$8$1$kOVJ3afrAbUHav/DgixwDg==$ozB1K40J2wHhWVVD3uuhXo8AiYNCd02LnI4Vg+uRs4cYLBVXNJaPOhW7rATbmid0/2aMvHPxxCKFkxu2Mj7feA==', 'ACTIVE', FALSE, NULL, NOW(), NOW()
FROM persons p WHERE p.identification = '1105015927'
ON CONFLICT (person_id) DO NOTHING;
INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at)
SELECT gen_random_uuid(), u.id, r.id, NOW(), NOW()
FROM users u JOIN persons p ON p.id = u.person_id JOIN roles r ON r.name = 'receptionist'
WHERE p.identification = '1105015927'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- PNF-04 / R-12: quitarle el rol con sesión abierta y verificar bloqueo inmediato.
INSERT INTO persons (id, identification, first_name, last_name, email, phone, created_at, updated_at)
VALUES (gen_random_uuid(), '1105016297', 'Diego', 'Rotación QA', 'qa.rotacion@vetmanage.test', '0991100018', NOW(), NOW())
ON CONFLICT (identification) DO NOTHING;
INSERT INTO users (id, person_id, password, status, must_change_password, deactivated_at, created_at, updated_at)
SELECT gen_random_uuid(), p.id, 'scrypt$16384$8$1$kOVJ3afrAbUHav/DgixwDg==$ozB1K40J2wHhWVVD3uuhXo8AiYNCd02LnI4Vg+uRs4cYLBVXNJaPOhW7rATbmid0/2aMvHPxxCKFkxu2Mj7feA==', 'ACTIVE', FALSE, NULL, NOW(), NOW()
FROM persons p WHERE p.identification = '1105016297'
ON CONFLICT (person_id) DO NOTHING;
INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at)
SELECT gen_random_uuid(), u.id, r.id, NOW(), NOW()
FROM users u JOIN persons p ON p.id = u.person_id JOIN roles r ON r.name = 'receptionist'
WHERE p.identification = '1105016297'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- 2. Clientes
-- HU-51 Esc. 3: ya es Cliente; HU-06 búsqueda; dueña de pacientes QA.
INSERT INTO persons (id, identification, first_name, last_name, email, phone, address, created_at, updated_at)
VALUES (gen_random_uuid(), '1105016669', 'Ana', 'Ruiz', 'ana.ruiz@correo.test', '0987000001', 'Av. Universitaria y 10 de Agosto, Loja', NOW(), NOW())
ON CONFLICT (identification) DO NOTHING;
INSERT INTO clients (id, person_id, status, created_at, updated_at)
SELECT gen_random_uuid(), p.id, 'ACTIVE', NOW(), NOW() FROM persons p WHERE p.identification = '1105016669'
ON CONFLICT (person_id) DO NOTHING;
INSERT INTO users (id, person_id, password, status, must_change_password, created_at, updated_at)
SELECT gen_random_uuid(), p.id, 'scrypt$16384$8$1$kOVJ3afrAbUHav/DgixwDg==$ozB1K40J2wHhWVVD3uuhXo8AiYNCd02LnI4Vg+uRs4cYLBVXNJaPOhW7rATbmid0/2aMvHPxxCKFkxu2Mj7feA==', 'ACTIVE', TRUE, NOW(), NOW() FROM persons p WHERE p.identification = '1105016669'
ON CONFLICT (person_id) DO NOTHING;
INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at)
SELECT gen_random_uuid(), u.id, r.id, NOW(), NOW()
FROM users u JOIN persons p ON p.id = u.person_id JOIN roles r ON r.name = 'client'
WHERE p.identification = '1105016669'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- HU-06 y HU-12: búsqueda exacta por cédula y dueño de Firulais y Luna.
INSERT INTO persons (id, identification, first_name, last_name, email, phone, address, created_at, updated_at)
VALUES (gen_random_uuid(), '1105017030', 'Pedro', 'Castillo', 'pedro.castillo@correo.test', '0987000002', 'Calle Sucre 12-34, Loja', NOW(), NOW())
ON CONFLICT (identification) DO NOTHING;
INSERT INTO clients (id, person_id, status, created_at, updated_at)
SELECT gen_random_uuid(), p.id, 'ACTIVE', NOW(), NOW() FROM persons p WHERE p.identification = '1105017030'
ON CONFLICT (person_id) DO NOTHING;
INSERT INTO users (id, person_id, password, status, must_change_password, created_at, updated_at)
SELECT gen_random_uuid(), p.id, 'scrypt$16384$8$1$kOVJ3afrAbUHav/DgixwDg==$ozB1K40J2wHhWVVD3uuhXo8AiYNCd02LnI4Vg+uRs4cYLBVXNJaPOhW7rATbmid0/2aMvHPxxCKFkxu2Mj7feA==', 'ACTIVE', TRUE, NOW(), NOW() FROM persons p WHERE p.identification = '1105017030'
ON CONFLICT (person_id) DO NOTHING;
INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at)
SELECT gen_random_uuid(), u.id, r.id, NOW(), NOW()
FROM users u JOIN persons p ON p.id = u.person_id JOIN roles r ON r.name = 'client'
WHERE p.identification = '1105017030'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- HU-06 búsqueda de nombre sin tilde; HU-12 búsqueda de dueña; sin dirección.
INSERT INTO persons (id, identification, first_name, last_name, email, phone, address, created_at, updated_at)
VALUES (gen_random_uuid(), '1105017402', 'Lucía', 'Ordóñez', 'lucia.ordonez@correo.test', '0987000003', NULL, NOW(), NOW())
ON CONFLICT (identification) DO NOTHING;
INSERT INTO clients (id, person_id, status, created_at, updated_at)
SELECT gen_random_uuid(), p.id, 'ACTIVE', NOW(), NOW() FROM persons p WHERE p.identification = '1105017402'
ON CONFLICT (person_id) DO NOTHING;
INSERT INTO users (id, person_id, password, status, must_change_password, created_at, updated_at)
SELECT gen_random_uuid(), p.id, 'scrypt$16384$8$1$kOVJ3afrAbUHav/DgixwDg==$ozB1K40J2wHhWVVD3uuhXo8AiYNCd02LnI4Vg+uRs4cYLBVXNJaPOhW7rATbmid0/2aMvHPxxCKFkxu2Mj7feA==', 'ACTIVE', TRUE, NOW(), NOW() FROM persons p WHERE p.identification = '1105017402'
ON CONFLICT (person_id) DO NOTHING;
INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at)
SELECT gen_random_uuid(), u.id, r.id, NOW(), NOW()
FROM users u JOIN persons p ON p.id = u.person_id JOIN roles r ON r.name = 'client'
WHERE p.identification = '1105017402'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- HU-07: cliente inactivo no disponible (R-08).
INSERT INTO persons (id, identification, first_name, last_name, email, phone, address, created_at, updated_at)
VALUES (gen_random_uuid(), '1105017774', 'Rosa', 'Jaramillo', 'rosa.jaramillo@correo.test', '0987000004', 'Barrio El Valle, Loja', NOW(), NOW())
ON CONFLICT (identification) DO NOTHING;
INSERT INTO clients (id, person_id, status, created_at, updated_at)
SELECT gen_random_uuid(), p.id, 'INACTIVE', NOW(), NOW() FROM persons p WHERE p.identification = '1105017774'
ON CONFLICT (person_id) DO NOTHING;
INSERT INTO users (id, person_id, password, status, must_change_password, created_at, updated_at)
SELECT gen_random_uuid(), p.id, 'scrypt$16384$8$1$kOVJ3afrAbUHav/DgixwDg==$ozB1K40J2wHhWVVD3uuhXo8AiYNCd02LnI4Vg+uRs4cYLBVXNJaPOhW7rATbmid0/2aMvHPxxCKFkxu2Mj7feA==', 'ACTIVE', TRUE, NOW(), NOW() FROM persons p WHERE p.identification = '1105017774'
ON CONFLICT (person_id) DO NOTHING;
INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at)
SELECT gen_random_uuid(), u.id, r.id, NOW(), NOW()
FROM users u JOIN persons p ON p.id = u.person_id JOIN roles r ON r.name = 'client'
WHERE p.identification = '1105017774'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- HU-07 Esc. 5: cliente dado de baja.
INSERT INTO persons (id, identification, first_name, last_name, email, phone, address, created_at, updated_at)
VALUES (gen_random_uuid(), '1105018145', 'Hugo', 'Vivanco', 'hugo.vivanco@correo.test', '0987000005', 'Av. Cuxibamba, Loja', NOW(), NOW())
ON CONFLICT (identification) DO NOTHING;
INSERT INTO clients (id, person_id, status, created_at, updated_at)
SELECT gen_random_uuid(), p.id, 'DEACTIVATED', NOW(), NOW() FROM persons p WHERE p.identification = '1105018145'
ON CONFLICT (person_id) DO NOTHING;
INSERT INTO users (id, person_id, password, status, must_change_password, created_at, updated_at)
SELECT gen_random_uuid(), p.id, 'scrypt$16384$8$1$kOVJ3afrAbUHav/DgixwDg==$ozB1K40J2wHhWVVD3uuhXo8AiYNCd02LnI4Vg+uRs4cYLBVXNJaPOhW7rATbmid0/2aMvHPxxCKFkxu2Mj7feA==', 'ACTIVE', TRUE, NOW(), NOW() FROM persons p WHERE p.identification = '1105018145'
ON CONFLICT (person_id) DO NOTHING;
INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at)
SELECT gen_random_uuid(), u.id, r.id, NOW(), NOW()
FROM users u JOIN persons p ON p.id = u.person_id JOIN roles r ON r.name = 'client'
WHERE p.identification = '1105018145'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- 3. Especies adicionales
-- HU-07: especie inactiva no disponible; HU-17: especie no seleccionable para registrar razas.
INSERT INTO species (id, name, description, is_active, created_at, updated_at)
VALUES (gen_random_uuid(), 'Hurón', 'Especie inactiva para pruebas negativas.', FALSE, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 4. Pacientes
INSERT INTO patients (id, name, gender, birth_date, weight_kg, height_cm, reproductive_status, color, status, client_id, species_id, breed_id, created_at, updated_at)
SELECT gen_random_uuid(), 'Firulais', 'MALE', DATE '2021-03-15', 28.5, 60, 'STERILIZED', 'Dorado', 'ACTIVE', c.id, s.id, b.id, NOW(), NOW()
FROM clients c JOIN persons p ON p.id = c.person_id
JOIN species s ON s.name = 'Canino'
JOIN breeds b ON b.species_id = s.id AND b.name = 'Labrador Retriever'
WHERE p.identification = '1105017030'
  AND NOT EXISTS (SELECT 1 FROM patients x WHERE x.client_id = c.id AND x.name = 'Firulais');
INSERT INTO patients (id, name, gender, birth_date, weight_kg, height_cm, reproductive_status, color, status, client_id, species_id, breed_id, created_at, updated_at)
SELECT gen_random_uuid(), 'Luna', 'FEMALE', DATE '2023-05-20', 3.8, 23, 'STERILIZED', 'Blanco', 'ACTIVE', c.id, s.id, b.id, NOW(), NOW()
FROM clients c JOIN persons p ON p.id = c.person_id
JOIN species s ON s.name = 'Felino'
JOIN breeds b ON b.species_id = s.id AND b.name = 'Persa'
WHERE p.identification = '1105017030'
  AND NOT EXISTS (SELECT 1 FROM patients x WHERE x.client_id = c.id AND x.name = 'Luna');
INSERT INTO patients (id, name, gender, birth_date, weight_kg, height_cm, reproductive_status, color, status, client_id, species_id, breed_id, created_at, updated_at)
SELECT gen_random_uuid(), 'Michi', 'FEMALE', DATE '2022-08-01', 4.2, 25, 'NOT_STERILIZED', NULL, 'ACTIVE', c.id, s.id, b.id, NOW(), NOW()
FROM clients c JOIN persons p ON p.id = c.person_id
JOIN species s ON s.name = 'Felino'
JOIN breeds b ON b.species_id = s.id AND b.name = 'Siamés'
WHERE p.identification = '1105017402'
  AND NOT EXISTS (SELECT 1 FROM patients x WHERE x.client_id = c.id AND x.name = 'Michi');
INSERT INTO patients (id, name, gender, birth_date, weight_kg, height_cm, reproductive_status, color, status, client_id, species_id, breed_id, created_at, updated_at)
SELECT gen_random_uuid(), 'Rocky', 'MALE', DATE '2019-01-10', 12, 45, 'UNKNOWN', 'Negro', 'ACTIVE', c.id, s.id, b.id, NOW(), NOW()
FROM clients c JOIN persons p ON p.id = c.person_id
JOIN species s ON s.name = 'Canino'
JOIN breeds b ON b.species_id = s.id AND b.name = 'Mestizo'
WHERE p.identification = '1105016669'
  AND NOT EXISTS (SELECT 1 FROM patients x WHERE x.client_id = c.id AND x.name = 'Rocky');
INSERT INTO patients (id, name, gender, birth_date, weight_kg, height_cm, reproductive_status, color, status, client_id, species_id, breed_id, created_at, updated_at)
SELECT gen_random_uuid(), 'Toby', 'MALE', DATE '2018-11-02', 32, 63, 'NOT_STERILIZED', 'Negro y fuego', 'ACTIVE', c.id, s.id, b.id, NOW(), NOW()
FROM clients c JOIN persons p ON p.id = c.person_id
JOIN species s ON s.name = 'Canino'
JOIN breeds b ON b.species_id = s.id AND b.name = 'Pastor Alemán'
WHERE p.identification = '1105017774'
  AND NOT EXISTS (SELECT 1 FROM patients x WHERE x.client_id = c.id AND x.name = 'Toby');
INSERT INTO patients (id, name, gender, birth_date, weight_kg, height_cm, reproductive_status, color, status, client_id, species_id, breed_id, created_at, updated_at)
SELECT gen_random_uuid(), 'José', 'MALE', DATE '2020-06-12', 14, 42, 'UNKNOWN', NULL, 'ACTIVE', c.id, s.id, b.id, NOW(), NOW()
FROM clients c JOIN persons p ON p.id = c.person_id
JOIN species s ON s.name = 'Canino'
JOIN breeds b ON b.species_id = s.id AND b.name = 'Mestizo'
WHERE p.identification = '1105017402'
  AND NOT EXISTS (SELECT 1 FROM patients x WHERE x.client_id = c.id AND x.name = 'José');
INSERT INTO patients (id, name, gender, birth_date, weight_kg, height_cm, reproductive_status, color, status, client_id, species_id, breed_id, created_at, updated_at)
SELECT gen_random_uuid(), 'Nube', 'FEMALE', DATE '2023-02-02', 3.2, 21, 'STERILIZED', 'Gris', 'ACTIVE', c.id, s.id, b.id, NOW(), NOW()
FROM clients c JOIN persons p ON p.id = c.person_id
JOIN species s ON s.name = 'Felino'
JOIN breeds b ON b.species_id = s.id AND b.name = 'Mestizo'
WHERE p.identification = '1105016669'
  AND NOT EXISTS (SELECT 1 FROM patients x WHERE x.client_id = c.id AND x.name = 'Nube');
INSERT INTO patients (id, name, gender, birth_date, weight_kg, height_cm, reproductive_status, color, status, client_id, species_id, breed_id, created_at, updated_at)
SELECT gen_random_uuid(), 'Nube Inactiva', 'FEMALE', DATE '2022-04-04', 3.5, 22, 'STERILIZED', 'Gris', 'INACTIVE', c.id, s.id, b.id, NOW(), NOW()
FROM clients c JOIN persons p ON p.id = c.person_id
JOIN species s ON s.name = 'Felino'
JOIN breeds b ON b.species_id = s.id AND b.name = 'Mestizo'
WHERE p.identification = '1105016669'
  AND NOT EXISTS (SELECT 1 FROM patients x WHERE x.client_id = c.id AND x.name = 'Nube Inactiva');
INSERT INTO patients (id, name, gender, birth_date, weight_kg, height_cm, reproductive_status, color, status, client_id, species_id, breed_id, created_at, updated_at)
SELECT gen_random_uuid(), 'Nube Baja', 'FEMALE', DATE '2021-09-09', 4.1, 24, 'UNKNOWN', 'Blanco', 'DEACTIVATED', c.id, s.id, b.id, NOW(), NOW()
FROM clients c JOIN persons p ON p.id = c.person_id
JOIN species s ON s.name = 'Felino'
JOIN breeds b ON b.species_id = s.id AND b.name = 'Persa'
WHERE p.identification = '1105016669'
  AND NOT EXISTS (SELECT 1 FROM patients x WHERE x.client_id = c.id AND x.name = 'Nube Baja');

COMMIT;
