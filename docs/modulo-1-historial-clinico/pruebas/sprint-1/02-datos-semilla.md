# Datos semilla – Sprint 1

> Generado desde `qa/sprint-1/staging/seed/qa-seed.data.json` (fuente única). El SQL se genera con `npm run seed:sql` y se carga/respalda con `pg_restore`/`pg_dump` (ver [03-staging-y-ejecucion-unit-api.md](03-staging-y-ejecucion-unit-api.md)).

- Contraseña común de las cuentas QA: `QaVet2026` (solo para el ambiente Staging local).
- Todas las cédulas cumplen el algoritmo módulo 10 (provincia 11 – Loja). Las cédulas de los ejemplos de las HU (1104567890, 1105555555) **no** son válidas, por eso se reemplazaron.
- Además de esta semilla, Staging carga el seed de la aplicación (`npm run seed`): especies Canino, Felino, Bovino, Equino, Porcino, Conejo, Ave, Reptil y sus razas.

## 1. Usuarios – los 8 roles del sistema

| # | Rol | Nombre | Cédula | Correo | Estado | Uso en las pruebas |
| :-: | --- | --- | --- | --- | --- | --- |
| 1 | Administrador | Andrea Administradora QA | 1105010001 | qa.admin@vetmanage.test | ACTIVE | Rol 1/8 Administrador: registra usuarios (HU-51) y asigna roles (HU-54). |
| 2 | Gerente | Gabriel Gerente QA | 1105010373 | qa.gerente@vetmanage.test | ACTIVE | Rol 2/8 Gerente: registra clientes (HU-01) y pacientes (HU-07). |
| 3 | Veterinario | Valeria Veterinaria QA | 1105010746 | qa.veterinario@vetmanage.test | ACTIVE | Rol 3/8 Veterinario: registra especies (HU-13), clientes (HU-01); sin permiso para roles (HU-54 Esc. 8). |
| 4 | Técnico Veterinario | Tomás Técnico QA | 1105011116 | qa.tecnico@vetmanage.test | ACTIVE | Rol 4/8 Técnico Veterinario: solo consulta clientes/pacientes; pruebas negativas de permisos. |
| 5 | Recepcionista | Rebeca Recepcionista QA | 1105011488 | qa.recepcion@vetmanage.test | ACTIVE | Rol 5/8 Recepcionista: registra clientes y pacientes; sin permiso para registrar usuarios (HU-51 Esc. 9). |
| 6 | Cajero | Camilo Cajero QA | 1105011850 | qa.cajero@vetmanage.test | ACTIVE | Rol 6/8 Cajero: sin permisos del Módulo 1; pruebas de confidencialidad (PNF-01). |
| 7 | Bodeguero | Bruno Bodeguero QA | 1105012221 | qa.bodeguero@vetmanage.test | ACTIVE | Rol 7/8 Bodeguero: sin permisos del Módulo 1; pruebas de confidencialidad (PNF-01). |
| 8 | Cliente | Clara Cliente QA | 1105012593 | qa.cliente@vetmanage.test | ACTIVE | Rol 8/8 Cliente: inicia sesión pero no accede a funciones del personal. |

## 2. Usuarios para escenarios específicos

| Rol(es) | Nombre | Cédula | Correo | Estado | Uso en las pruebas |
| --- | --- | --- | --- | --- | --- |
| Gerente + Administrador | Jorge Solís | 1105012965 | qa.multirol@vetmanage.test | ACTIVE | HU-57 Esc. 2 (varios roles) y segundo Administrador activo para HU-54. |
| Recepcionista | Carlos Pérez | 1105013336 | qa.cperez@vetmanage.test | ACTIVE | HU-54 Esc. 1-4 y 6: asignar, quitar y cambiar roles. |
| Recepcionista | Luis Ríos | 1105013708 | qa.lrios@vetmanage.test | DEACTIVATED | HU-54 Esc. 7 (usuario dado de baja) y HU-57 Esc. 8. |
| Recepcionista | Irene Inactiva QA | 1105014078 | qa.inactivo@vetmanage.test | INACTIVE | HU-57 Esc. 8 (cuenta inactiva). |
| Recepcionista | Teresa Temporal QA | 1105014441 | qa.temporal@vetmanage.test | ACTIVE · contraseña temporal | HU-57 Esc. 9 (primer ingreso con contraseña temporal). |
| Veterinario | Bernardo Bloqueo QA | 1105014813 | qa.bloqueo@vetmanage.test | ACTIVE | HU-57 Esc. 5-6: bloqueo al 5.º intento (E2E). |
| Veterinario | Cecilia Contador QA | 1105015182 | qa.contador@vetmanage.test | ACTIVE | HU-57 Esc. 7: reinicio del contador de intentos. |
| Veterinario | Bianca Bloqueo API QA | 1105015554 | qa.bloqueo.api@vetmanage.test | ACTIVE | HU-57 Esc. 5-6 en la suite de integración (independiente del E2E). |
| Recepcionista | María López | 1105015927 | mlopez@vetmanage.com | ACTIVE | HU-51 Esc. 7: correo ya registrado. |
| Recepcionista | Diego Rotación QA | 1105016297 | qa.rotacion@vetmanage.test | ACTIVE | PNF-04 / R-12: quitarle el rol con sesión abierta y verificar bloqueo inmediato. |

## 3. Clientes

| Nombre | Cédula | Correo | Teléfono | Dirección | Estado | Uso en las pruebas |
| --- | --- | --- | --- | --- | --- | --- |
| Ana Ruiz | 1105016669 | ana.ruiz@correo.test | 0987000001 | Av. Universitaria y 10 de Agosto, Loja | ACTIVE | HU-51 Esc. 3: ya es Cliente; se la registra como Cajero sin duplicar la persona. |
| Pedro Castillo | 1105017030 | pedro.castillo@correo.test | 0987000002 | Calle Sucre 12-34, Loja | ACTIVE | Dueño de Firulais y Luna; cliente por defecto para HU-07. |
| Lucía Ordóñez | 1105017402 | lucia.ordonez@correo.test | 0987000003 | — | ACTIVE | Cliente sin dirección (campo opcional). |
| Rosa Jaramillo | 1105017774 | rosa.jaramillo@correo.test | 0987000004 | Barrio El Valle, Loja | INACTIVE | HU-07: cliente inactivo no disponible (R-08). |
| Hugo Vivanco | 1105018145 | hugo.vivanco@correo.test | 0987000005 | Av. Cuxibamba, Loja | DEACTIVATED | HU-07 Esc. 5: cliente dado de baja. |

## 4. Pacientes

| Nombre | Especie / raza | Sexo | Nacimiento | Peso (kg) | Talla (cm) | Estado reproductivo | Color | Dueño |
| --- | --- | --- | --- | :-: | :-: | --- | --- | --- |
| Firulais | Canino / Labrador Retriever | MALE | 2021-03-15 | 28.5 | 60 | STERILIZED | Dorado | Pedro Castillo |
| Luna | Felino / Persa | FEMALE | 2023-05-20 | 3.8 | 23 | STERILIZED | Blanco | Pedro Castillo |
| Michi | Felino / Siamés | FEMALE | 2022-08-01 | 4.2 | 25 | NOT_STERILIZED | — | Lucía Ordóñez |
| Rocky | Canino / Mestizo | MALE | 2019-01-10 | 12 | 45 | UNKNOWN | Negro | Ana Ruiz |
| Toby | Canino / Pastor Alemán | MALE | 2018-11-02 | 32 | 63 | NOT_STERILIZED | Negro y fuego | Rosa Jaramillo |

## 5. Catálogo adicional

- Especie **Hurón** (inactiva): HU-07: especie inactiva no disponible.

## 6. Cédulas reservadas para crear registros nuevos

No existen en la semilla; las pruebas las usan para altas. Como la base se restaura antes de cada corrida, se pueden reutilizar.

`1105018517` · `1105018889` · `1105019259` · `1105019622` · `1105019994` · `1105020364` · `1105020737`
