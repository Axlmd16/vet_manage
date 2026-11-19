# Pruebas – Sprint 1 (Módulo 1 – Historial Clínico)

Documentación de QA del Sprint 1 según el *Plan de Pruebas Ágil – VetManage* (sección 6.3, cronograma del Sprint 1).

**HU bajo prueba:** HU-51 Registrar usuario · HU-54 Asignar y quitar roles · HU-01 Registrar cliente · HU-07 Registrar paciente · HU-13 Registrar especie. Se incluye HU-57 Iniciar sesión porque las pruebas E2E del cronograma cubren el login y el bloqueo al 5.º intento.

**Rama:** `test/sprint-1-qa` (desde `development`). El código de las pruebas está en [`qa/`](../../../../qa/) y en `vet-manage-api/test/qa/`; esta carpeta solo tiene la documentación y los entregables.

## Etapas y entregables

| Etapa (cronograma) | Documento | Entregable |
| --- | --- | --- |
| 1. Diseño: casos de prueba y datos semilla | [01-matriz-casos-prueba.md](01-matriz-casos-prueba.md) · [02-datos-semilla.md](02-datos-semilla.md) | [Matriz de casos de prueba (.xlsx)](entregables/matriz-casos-prueba-sprint-1.xlsx) |
| 2. Staging, semilla (pg_dump/pg_restore), CE-01 a CE-03, unitarias e integración API | [03-staging-y-ejecucion-unit-api.md](03-staging-y-ejecucion-unit-api.md) | Reporte de cobertura y resultados |
| 3. E2E (Playwright / Cucumber.js) | [04-ejecucion-e2e.md](04-ejecucion-e2e.md) | [Matriz de errores (.xlsx)](entregables/matriz-errores-sprint-1.xlsx) · [05-matriz-errores.md](05-matriz-errores.md) |

## Decisiones tomadas con el equipo

| Tema | Decisión | Motivo |
| --- | --- | --- |
| Jest (plan) vs Vitest (proyecto) | Se usa **Vitest** para unitarias e integración | El proyecto ya usa Vitest; su API (`describe/it/expect/vi.fn`) es compatible con Jest, así que los casos y la proporción de la pirámide (≈60 % unitarias) se mantienen sin agregar un segundo runner. |
| Staging | **Docker local aislado** (`qa/sprint-1/staging/docker-compose.staging.yml`) | No hay servidor de Staging; se levanta un ambiente separado del de desarrollo (otros puertos, otra base) para no mezclar datos. |
| Defectos | Solo se **reportan** en la matriz de errores | El tester no corrige el código de los desarrolladores; cada defecto se asigna al responsable de la HU. |
| Formato de matrices | Excel (entrega) + Markdown (versionado) | Ambos se generan desde la misma fuente con `npm run matrices` en `qa/`. |

## Cómo regenerar los entregables

```bash
cd qa
npm install
npm run matrices
```
