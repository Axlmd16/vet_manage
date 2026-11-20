# Pruebas – Sprint 1 (Módulo 1 – Historial Clínico)

Documentación de QA del Sprint 1 según el *Plan de Pruebas Ágil – VetManage* (sección 6.3, cronograma del Sprint 1).

**HU bajo prueba:** HU-51 Registrar usuario · HU-54 Asignar y quitar roles · HU-57 Iniciar sesión · HU-01 Registrar cliente · HU-06 Consultar clientes · HU-07 Registrar paciente · HU-12 Consultar paciente · HU-13 Registrar especie · HU-17 Registrar raza.

**Rama:** `test/sprint-1-qa` (desde `development`). El código de las pruebas está en [`qa/`](../../../../qa/), `vet-manage-api/test/qa/` y `vet-manage-frontend/src/test/qa/`; esta carpeta tiene la documentación y los entregables.

## Etapas y entregables

| Etapa (cronograma) | Documento | Entregable |
| --- | --- | --- |
| 1. Diseño: casos de prueba y datos semilla | [01-matriz-casos-prueba.md](01-matriz-casos-prueba.md) · [02-datos-semilla.md](02-datos-semilla.md) | [Matriz de casos de prueba (.xlsx)](entregables/matriz-casos-prueba-sprint-1.xlsx) |
| 2. Staging, semilla (pg_dump/pg_restore), CE-01 a CE-03, unitarias e integración API | [03-staging-y-ejecucion-unit-api.md](03-staging-y-ejecucion-unit-api.md) | [Validación CE](../../../../qa/sprint-1/reports/ce-validation.md) · [Cobertura](../../../../qa/sprint-1/reports/coverage/index.html) · [Newman](../../../../qa/sprint-1/reports/newman/newman-report.html) |
| 3. E2E (Playwright / Cucumber.js) | [04-ejecucion-e2e.md](04-ejecucion-e2e.md) · [05-matriz-errores.md](05-matriz-errores.md) | [Matriz de errores (.xlsx)](entregables/matriz-errores-sprint-1.xlsx) |
| Reporte: una evidencia por caso | [evidencias/README.md](evidencias/README.md) | 109 fichas `evidencias/CP-xx-yy.jpg` |

## Resumen de resultados

La matriz contiene **109 casos de prueba** (35 positivos, 58 negativos y 16 de valor límite). Se consolidaron los resultados automatizados de los 86 casos originales (72 pasaron, 14 fallaron) y la ejecución manual de HU-06, HU-12 y HU-17: 7 pasaron, 3 fallaron, 8 quedaron bloqueados y 5 siguen pendientes. Los hallazgos de HU-06 y HU-12 se registraron junto a los 7 defectos previos: **11 defectos** (7 de severidad Alta, 4 Media, ninguno Crítico). Los casos bloqueados de HU-12 no se contaron como aprobados ni fallidos porque la funcionalidad de consulta no está disponible.

Resultados históricos de los 86 casos originales:

| Nivel | Herramienta | Pruebas | Pasan | Fallan | Proporción (plan) |
| --- | --- | :-: | :-: | :-: | :-: |
| Unitarias | Vitest – API (servicios) y frontend (formularios) | 152 | 130 | 22 | 59 % (≈60 %) |
| Integración API | Supertest contra Staging + SQL | 75 | 63 | 12 | 29 % (≈25 %) |
| Integración API (regresión) | Newman – 30 peticiones / 53 aserciones | 22 casos | 19 | 3 | — |
| E2E | Playwright | 21 | 17 | 4 | 12 % (≈10 % + 5 %) |
| Aceptación | Cucumber.js (Gherkin en español) | 9 | 8 | 1 | |

Cobertura de líneas de la lógica de negocio de las HU: **93,3 %** (meta ≥ 90 %).

### Ciclo 2 – retest del 20/11/2026 (tras integrar `development`)

Se integró `upstream/development` (renombrado pet → patient, auditoría HT-04, permisos de especies, HU-06) y se volvió a ejecutar toda la suite automatizada sobre Staging reconstruido desde cero.

| Nivel | Pruebas | Pasan | Fallan |
| --- | :-: | :-: | :-: |
| Unitarias API / frontend | 110 / 42 | 98 / 32 | 12 / 10 |
| Integración Supertest | 75 | 65 | 10 |
| Newman (casos) | 22 | 19 | 3 |
| E2E Playwright | 20 (+1 omitida: pantalla de auditoría = HU-60) | 17 | 3 |
| Aceptación Cucumber | 9 | 8 | 1 |

- **DEF-07 cerrado:** el Administrador ya recibe 403 al registrar especies (CP-13-09 pasa).
- **DEF-05 corregido en parte:** el alta de usuarios y el cambio de roles quedan en `audit_logs` (CP-51-18 pasa), pero sin valor anterior ni nuevo (CP-54-14 falla).
- **DEF-01 a DEF-04 y DEF-06 siguen abiertos.**
- **DEF-12 nuevo (Crítico):** en una base nueva las migraciones fallan por el orden de `agendamiento_citas` y `rename_pets_to_patients`. Staging usa un rodeo temporal (`qa/sprint-1/staging/scripts/workaround-migration-order.sh`).
- Los casos de HU-06, HU-12 y HU-17 se ejecutaron a mano; conservan su resultado manual y conviene repetirlos ahora que HU-06 está integrada.

Resultados de ejecución manual para las historias solicitadas:

| HU | Pasaron | Fallaron | Bloqueados | Pendientes | Hallazgos |
| --- | :-: | :-: | :-: | :-: | --- |
| HU-06 Consultar clientes | 1 | 2 | 1 | 0 | DEF-08 a DEF-10 |
| HU-12 Consultar datos del paciente | 0 | 1 | 7 | 1 | DEF-11 |
| HU-17 Registrar raza | 6 | 0 | 0 | 4 | — |

| Defecto | HU | Severidad | Resumen |
| --- | --- | --- | --- |
| DEF-01 | HU-01 | 2 - High | Se acepta la cédula de un cliente existente y se descartan los datos ingresados |
| DEF-02 | HU-01 | 2 - High | El teléfono no es obligatorio |
| DEF-03 | HU-01 | 3 - Medium | El teléfono acepta 7-15 dígitos y cualquier prefijo |
| DEF-04 | HU-01 | 3 - Medium | Mensajes distintos a los criterios de aceptación |
| DEF-05 | HU-51, HU-54 | 2 - High | La auditoría no guarda el valor anterior ni el nuevo (ciclo 2: corregido en parte) |
| DEF-06 | HU-57 | 2 - High | La contraseña temporal no obliga a cambiarla en el primer ingreso |
| DEF-07 | HU-13 | 3 - Medium | ~~El Administrador puede registrar especies~~ **Cerrado en ciclo 2** |
| DEF-08 | HU-06 | 2 - High | Pantalla de clientes sin búsqueda ni consulta |
| DEF-09 | HU-06 | 3 - Medium | Búsqueda no encuentra nombres sin tilde |
| DEF-10 | HU-06 | 2 - High | No se muestran las mascotas asociadas al cliente |
| DEF-11 | HU-12 | 2 - High | Pantalla y endpoint de consulta de pacientes no implementados |
| DEF-12 | Migraciones | 1 - Critical | En una base nueva las migraciones fallan (agendamiento referencia `patients` antes de que exista) |

Por HU: **HU-51, HU-54, HU-07 y HU-13** cumplen sus criterios de aceptación (con DEF-05 y DEF-07 como hallazgos de seguridad transversales); **HU-01** no cumple; **HU-57** cumple salvo el Esc. 9 (DEF-06).

## Criterios de salida (estado al 20/11/2026)

| Criterio | Estado | Detalle |
| --- | --- | --- |
| CS-01 Ejecución completa | ⏳ | Los 86 casos originales se ejecutaron. HU-06 y HU-17 se ejecutaron parcialmente; HU-12 tiene 7 casos bloqueados por la funcionalidad ausente |
| CS-02 Sin defectos críticos/bloqueantes abiertos | ❌ | DEF-12 (Crítico) bloquea cualquier despliegue desde cero |
| CS-03 Defectos menores documentados | ⏳ | Documentados; falta la decisión del PO sobre diferirlos |
| CS-04 Criterios de aceptación cumplidos | ❌ | HU-01 no cumple (DEF-01 a DEF-04); HU-57 Esc. 9 (DEF-06) |
| CS-05 Regresión exitosa | ⏳ | La suite queda automatizada (`run-unit-api.sh`, `run-e2e.sh`, GitHub Actions); se repite tras las correcciones (retest, BUG_CYCLE 2) |
| CS-06 Reporte final aprobado | ⏳ | Pendiente de la Sprint Review con el PO |

## Decisiones tomadas con el equipo

| Tema | Decisión | Motivo |
| --- | --- | --- |
| Jest (plan) vs Vitest (proyecto) | Se usa **Vitest** para unitarias e integración | El proyecto ya usa Vitest; su API (`describe/it/expect/vi.fn`) es compatible con Jest, así que los casos y la proporción de la pirámide se mantienen sin agregar un segundo runner. |
| Staging | **Docker local aislado** (`qa/sprint-1/staging/docker-compose.staging.yml`) | No hay servidor de Staging; se levanta un ambiente separado del de desarrollo (otros puertos, otra base) para no mezclar datos. |
| Defectos | Solo se **reportan** en la matriz de errores | El tester no corrige el código de los desarrolladores; cada defecto se asigna al responsable del archivo afectado. |
| Pruebas QA separadas de las de desarrollo | Extensiones `*.qa-spec.ts` / `*.qa.test.ts` y configuraciones `vitest.config.qa*.ts` | `npm test` de los desarrolladores no cambia; las pruebas QA verifican las HU tal como están escritas y sus fallas son defectos. |
| Formato de matrices | Excel (entrega) + Markdown (versionado) | Ambos se generan desde la misma fuente con `npm run matrices` en `qa/`. |

## Cómo ejecutar todo

Requisitos: Docker, Node 24 y Git Bash (en Windows).

```bash
bash qa/sprint-1/staging/scripts/deploy-staging.sh
```

```bash
bash qa/sprint-1/staging/scripts/seed-staging.sh
```

```bash
(cd vet-manage-api && npm ci && npx prisma generate) && (cd vet-manage-frontend && npm ci) && (cd qa && npm ci && npx playwright install chromium)
```

```bash
bash qa/sprint-1/staging/scripts/validate-ce.sh
```

```bash
bash qa/sprint-1/run-unit-api.sh
```

```bash
bash qa/sprint-1/run-e2e.sh
```

```bash
cd qa && node sprint-1/tools/collect-results.mjs && npm run matrices
```

El último comando consolida los resultados de todas las suites en la columna "Resultado de ejecución" de la matriz de casos y regenera los entregables.
