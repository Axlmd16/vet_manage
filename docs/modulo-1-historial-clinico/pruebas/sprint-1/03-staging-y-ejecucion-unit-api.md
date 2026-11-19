# Etapa 2 – Staging, datos semilla, criterios de entrada y pruebas unitarias / de integración

Cronograma del Sprint 1, día 2: *Despliegue de Staging, carga de datos semilla en PostgreSQL (pg_dump/pg_restore) y validación de CE-01 a CE-03. Ejecución de pruebas unitarias (Jest 60 %) e integración API (Supertest / Newman 25 %).*

Fecha de ejecución: 19/11/2026 · Rama `test/sprint-1-qa` · Responsables: Christian Robles, Estefania Torres.

## 1. Ambiente Staging

No existe un servidor de Staging, así que se levantó uno local con Docker, **aislado del ambiente de desarrollo** (otro proyecto de Compose, otra base de datos y otros puertos). La API corre compilada (`node dist/main.js`) y el frontend con `vite build` + `vite preview`: es decir, como se desplegaría, sin hot reload.

| Servicio | Staging | Desarrollo (sin cambios) |
| --- | --- | --- |
| API | http://localhost:3180/api/v1 | :3080 |
| Frontend | http://localhost:5184 | :5174 |
| PostgreSQL 17 (`vet_manage_staging`) | localhost:56432 | :55432 |
| Redis / RabbitMQ | :57379 / :56672 | :56379 / :55672 |
| Mailpit (correos capturados) | http://localhost:59025 | :58025 |

Archivos: [`qa/sprint-1/staging/`](../../../../qa/sprint-1/staging/)

```bash
bash qa/sprint-1/staging/scripts/deploy-staging.sh    # build + migraciones + arranque
bash qa/sprint-1/staging/scripts/seed-staging.sh      # seed de la app + semilla QA + pg_dump
bash qa/sprint-1/staging/scripts/restore-staging.sh   # pg_restore (antes de cada corrida)
bash qa/sprint-1/staging/scripts/validate-ce.sh       # CE-01 a CE-03
```

### Incidencias del despliegue (resueltas en la configuración de Staging)

| Incidencia | Causa | Solución |
| --- | --- | --- |
| RabbitMQ no arrancaba (`invalid_dist_port_range,76672`) | Con `RABBITMQ_NODE_PORT=56672` el puerto de distribución (+20000) queda fuera de rango | Se usa un `rabbitmq.conf` propio (`listeners.tcp.default`), igual que el ambiente de desarrollo |
| La API quedaba *unhealthy* aunque arrancaba | En Alpine `localhost` resuelve a IPv6 y la API escucha en `0.0.0.0` | El healthcheck usa `127.0.0.1` |
| Clientes de la semilla no aparecían en la búsqueda de clientes | El listado solo muestra personas con cuenta de rol *Cliente* (así los crea HU-01); la semilla inicial insertaba clientes sin cuenta | La semilla crea la cuenta con rol Cliente para cada cliente, igual que el registro real |

## 2. Datos semilla y respaldo (pg_dump / pg_restore)

1. Seed de la aplicación (`npm run seed` dentro del contenedor): especies, razas, inventario y usuarios demo.
2. Semilla QA [`qa-seed.sql`](../../../../qa/sprint-1/staging/seed/qa-seed.sql), generada desde [`qa-seed.data.json`](../../../../qa/sprint-1/staging/seed/qa-seed.data.json) (detalle en [02-datos-semilla.md](02-datos-semilla.md)).
3. `pg_dump -Fc` → `backups/qa-seed.dump` (56 KB, 16 tablas con datos).
4. Antes de cada suite: `pg_restore --clean --if-exists --single-transaction` + `FLUSHALL` de Redis.

| Medición | Resultado |
| --- | --- |
| Registros tras la carga | 35 usuarios · 6 clientes · 5 pacientes · 9 especies · 8 razas |
| Tiempo de restauración | 1-2 s por corrida (OC-06 exige ≤ 30 min) |
| Registros perdidos tras restaurar | 0 (los conteos coinciden con los de la carga) |

## 3. Criterios de entrada CE-01 a CE-03

Evidencia completa: [`qa/sprint-1/reports/ce-validation.md`](../../../../qa/sprint-1/reports/ce-validation.md).

| Criterio | Verificaciones | Resultado |
| --- | --- | --- |
| CE-01 HU y criterios definidos | Las 6 HU tienen sus escenarios en Gherkin (44 escenarios en total) | ✅ Cumple |
| CE-02 Funcionalidad implementada y desplegada | 6 PR de las HU integrados en `development`; los 6 endpoints responden en Staging (401 sin sesión, login 200) | ✅ Cumple |
| CE-03 Entorno y herramientas operativas | API lista (PostgreSQL, Redis, RabbitMQ), conexión directa a la BD, semilla con los 8 roles, respaldo disponible, frontend y Mailpit arriba, pipeline definido, Vitest/Supertest/Newman/Playwright/Cucumber instalados | ✅ Cumple |

> **Observación sobre CE-03:** el pipeline [`.github/workflows/qa-sprint-1.yml`](../../../../.github/workflows/qa-sprint-1.yml) está definido, pero todavía no corrió en GitHub Actions porque la rama no se ha subido. Se valida en el primer push.

## 4. Pruebas unitarias (≈60 %) – Vitest

Se usa **Vitest** (ya configurado en el proyecto, API compatible con Jest). Las pruebas QA usan la extensión `*.qa-spec.ts` / `*.qa.test.ts` para no mezclarse con `npm test` de los desarrolladores. Cada prueba lleva el ID del caso de la matriz.

```bash
cd vet-manage-api && npm run test:qa:unit         # servicios del backend + cobertura
cd vet-manage-frontend && npm run test:qa         # reglas de los formularios
```

| Suite | Archivo | Pruebas | Pasan | Fallan |
| --- | --- | :-: | :-: | :-: |
| HU-51 Registrar usuario | `vet-manage-api/test/qa/unit/hu-51-register-user.qa-spec.ts` | 20 | 20 | 0 |
| HU-54 Asignar/quitar roles | `…/hu-54-role-assignment.qa-spec.ts` | 14 | 14 | 0 |
| HU-57 Iniciar sesión | `…/hu-57-login.qa-spec.ts` | 14 | 14 | 0 |
| HU-01 Registrar cliente | `…/hu-01-register-client.qa-spec.ts` | 18 | 6 | **12** |
| HU-07 Registrar paciente | `…/hu-07-register-pet.qa-spec.ts` | 27 | 27 | 0 |
| HU-13 Registrar especie | `…/hu-13-register-species.qa-spec.ts` | 10 | 10 | 0 |
| Cédula (regla común) | `…/identification.qa-spec.ts` | 7 | 7 | 0 |
| Formularios del frontend (HU-51/01/07/13) | `vet-manage-frontend/src/test/qa/form-rules.qa.test.ts` | 42 | 32 | **10** |
| **Total** | | **152** | **130** | **22** |

### Cobertura de la lógica de negocio (meta del plan ≥ 90 % · OC-12 ≥ 70 %)

Reporte HTML: [`qa/sprint-1/reports/coverage/index.html`](../../../../qa/sprint-1/reports/coverage/index.html)

| Archivo | Líneas | Ramas | Funciones |
| --- | :-: | :-: | :-: |
| `common/validation/identification.ts` | 100 % | 100 % | 100 % |
| `identity/services/user-registration.service.ts` | 92,8 % | 74,7 % | 88,2 % |
| `identity/services/user-role-assignment.service.ts` | 100 % | 89,2 % | 100 % |
| `identity/services/auth.service.ts` | 88,4 % | 65,2 % | 71,4 % |
| `identity/services/client-registration.service.ts` | 86,2 % | 71,4 % | 86,7 % |
| `pets/services/pets/register-pet.service.ts` | 100 % | 88 % | 100 % |
| `pets/services/pets/birth-date.ts` | 100 % | 92,9 % | 100 % |
| `pets/services/species/register-species.service.ts` | 100 % | 83,3 % | 100 % |
| **Total** | **93,3 %** ✅ | 78,2 % | 90,4 % |

Lo no cubierto de `auth.service.ts` es la renovación y cierre de sesión (`refresh`/`logout`), fuera del alcance de las HU de este sprint.

## 5. Pruebas de integración de API (≈25 %) – Supertest y Newman

Caja negra contra Staging, con la base restaurada antes de cada suite. Además del código HTTP y el mensaje, se verifica el estado en la base con **consultas SQL** (roles asignados, contador de intentos, personas no duplicadas) y el correo en **Mailpit**.

```bash
bash qa/sprint-1/run-unit-api.sh   # restaura y ejecuta unitarias + Supertest + Newman
```

### Supertest (Vitest) – `vet-manage-api/test/qa/api/`

| HU | Pruebas | Pasan | Fallan | Fallas |
| --- | :-: | :-: | :-: | --- |
| HU-51 | 13 | 12 | 1 | CP-51-18 sin auditoría |
| HU-54 | 12 | 11 | 1 | CP-54-14 sin auditoría |
| HU-57 | 10 | 10 | 0 | — |
| HU-01 | 15 | 6 | 9 | CP-01-01, 04, 05, 06, 07, 09, 10, 11, 12 |
| HU-07 | 17 | 17 | 0 | — |
| HU-13 | 8 | 7 | 1 | CP-13-09 el Administrador registra especies |
| **Total** | **75** | **63** | **12** | |

Riesgos del plan verificados aquí: **R-12 / PNF-04** (al quitar un rol con la sesión abierta, la siguiente petición se rechaza con 403 de inmediato) ✅, **R-29** (cuentas inactivas o dadas de baja no inician sesión) ✅, **R-36** (correo duplicado con mayúsculas) ✅, **R-08** (no se registran pacientes de clientes inactivos o de baja) ✅.

### Newman (Postman) – `qa/sprint-1/api/`

Colección [`vetmanage-sprint1.postman_collection.json`](../../../../qa/sprint-1/api/vetmanage-sprint1.postman_collection.json) (se puede importar en Postman) generada por `build-collection.mjs`. Reporte HTML: [`qa/sprint-1/reports/newman/newman-report.html`](../../../../qa/sprint-1/reports/newman/newman-report.html).

| Peticiones | Aserciones | Pasan | Fallan | Fallas |
| :-: | :-: | :-: | :-: | --- |
| 30 | 53 | 49 | 4 | CP-01-01 (mensaje), CP-01-06 (2: código y mensaje), CP-01-07 (mensaje) |

El login responde en menos de 2 s en todas las corridas.

## 6. Proporción de la pirámide

| Nivel | Herramienta | Pruebas | Proporción | Plan |
| --- | --- | :-: | :-: | :-: |
| Unitarias | Vitest (API + frontend) | 152 | 60 % | ≈60 % |
| Integración API | Supertest (+ 30 peticiones Newman de regresión sobre los mismos casos) | 75 | 30 % | ≈25 % |
| E2E / aceptación | Playwright + Cucumber.js | ver [04-ejecucion-e2e.md](04-ejecucion-e2e.md) | ≈10 % | ≈10 % + 5 % |

## 7. Hallazgos de la etapa

Todos se registran en la [matriz de errores](05-matriz-errores.md):

- **HU-01** no cumple sus criterios: mensajes distintos a los de la HU, el teléfono es opcional y acepta 7-15 dígitos con cualquier prefijo, y una cédula de un cliente existente se acepta con 201 en lugar de rechazarse.
- **Auditoría (OC-04 / PNF-05):** no existe tabla ni registro de auditoría para el alta de usuarios ni para los cambios de rol.
- **Matriz de roles:** el Administrador puede registrar especies (la matriz lo permite solo al Veterinario).
