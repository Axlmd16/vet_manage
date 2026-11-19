## Context

El sistema Vet Manage está estructurado como un monolito modular (NestJS en backend con Prisma 7, PostgreSQL y React/Vite en frontend). Se ha establecido la convención del Módulo 1 en `docs/backend-structure.md`, donde las entidades de catálogo animal y pacientes residen en el módulo `pets`.
Para satisfacer la HU-13 (Registrar especie, RF-13), se requiere la creación del modelo de datos `Species` y su endpoint en el backend, así como la pantalla y formulario correspondiente en el frontend.

## Goals / Non-Goals

**Goals:**
- Crear el modelo Prisma `Species` en `prisma/schema/pets.prisma` con soporte para migraciones.
- Implementar la estructura del módulo `pets` en `vet-manage-api/src/modules/pets/`:
  - `routes/species.controller.ts`: endpoint `POST /api/v1/pets/species` protegido con `JwtAuthGuard` y `@RequirePermissions('species:create')`.
  - `services/species/register-species.service.ts`: un servicio específico para la operación de registro (principio de un servicio por HU).
  - `repositories/species.repository.ts`: abstracción para persistencia con PrismaClient.
  - `dtos/species/register-species.dto.ts`: validación con `class-validator` y `class-transformer`.
- Implementar el módulo `pets` en `vet-manage-frontend/src/modules/pets/`:
  - Formulario de registro de especie con validación de campo requerido para `name`, campo opcional para `description`, botones "Guardar" y "Cancelar", y notificación de confirmación.
  - Esquema de validación compartido en `schemas/species.ts` y servicio API frontend en `services/species.service.ts`.
  - La pantalla de especies se integra como pestaña dentro de `/catalogs`; no se mantienen rutas independientes para evitar duplicar la pantalla.
- Proveer cobertura de pruebas unitarias (`register-species.service.spec.ts`) y de integración e2e.

**Non-Goals:**
- Consultar, editar, activar/inactivar especies (HU-14, HU-15, HU-16 corresponden a historias posteriores).
- Exponer `GET /pets/species`: el alcance de HU-13 se limita a `POST /pets/species`; el listado de especies se atenderá en historias posteriores.
- Registrar razas o pacientes (HU-17 y HU-07 se implementarán en sus respectivos cambios).

## Decisions

### 1. Ubicación y separación de esquemas Prisma
- **Decisión**: Crear `prisma/schema/pets.prisma` conteniendo el modelo `Species` (y preparado para `Breed` y `Pet`).
- **Justificación**: Cumple estrictamente con la guía de estructura de carpetas (`prisma/schema/pets.prisma`), manteniendo aislado el dominio de mascotas del de identidad e inventario.

### 2. Estructura de carpetas modular (Backend y Frontend)
- **Decisión**:
  - Backend: `vet-manage-api/src/modules/pets/` siguiendo el patrón `routes/`, `services/species/`, `repositories/`, `dtos/species/` y `pets.module.ts`.
  - Frontend: `vet-manage-frontend/src/modules/pets/` con `pages/`, `components/`, `services/`, `schemas/` y `types.ts`; la pantalla se monta desde `modules/catalogs/pages/catalogs-page.tsx`.
- **Justificación**: Respeta al 100% las directrices acordadas por el equipo en `docs/backend-structure.md`.

### 3. Control de acceso y permisos
- **Decisión**: Requerir `@RequirePermissions('species:create')` en el endpoint.
- **Justificación**: El catálogo de permisos de la matriz clínica (`clinical.permissions.ts`) ya define `species:create` ('Registrar especies') asignado a los roles Veterinario y Administrador.

## Risks / Trade-offs

- **[Riesgo de colisión de nombres duplicados]** → Mitigación: Índice único en `name` a nivel de base de datos y verificación previa o captura de error `P2002` en el repositorio/servicio para retornar HTTP 409 (Conflict) amigable.
- **[Migraciones concurrentes de base de datos]** → Mitigación: Notificar al equipo sobre la adición de `pets.prisma` y ejecutar `npx prisma migrate dev --name add_species_model`.
