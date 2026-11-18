## Why

Actualmente el sistema no dispone del catálogo de especies animales en el Módulo 1 (Historial Clínico). Para poder registrar pacientes (HU-07) y razas (HU-17), es indispensable contar con el catálogo base de especies animales gestionado por el personal veterinario. Esta capacidad implementa la historia de usuario HU-13 (RF-13), permitiendo registrar especies activas con nombre obligatorio y descripción opcional.

## What Changes

- **Esquema de base de datos**: Creación del modelo `Species` en Prisma (`prisma/schema/pets.prisma`) con id UUID, nombre único, descripción opcional, estado booleano/activo y timestamps de auditoría.
- **Backend (`vet-manage-api/`)**:
  - Creación del submódulo de especies dentro de `src/modules/pets/`.
  - Implementación del servicio de registro de especie (`services/species/register-species.service.ts`) siguiendo el principio de un servicio por operación.
  - Implementación del controlador de especies (`routes/species.controller.ts`) con endpoint `POST /api/v1/pets/species`.
  - Definición de DTOs con validación estricta (`dtos/species/register-species.dto.ts`).
  - Repositorio de especies (`repositories/species.repository.ts`).
  - Protección de endpoint mediante JWT Auth Guard y Permissions Guard requiriendo el permiso `species:create`.
  - Pruebas unitarias para el servicio y pruebas e2e para el endpoint.
- **Frontend (`vet-manage-frontend/`)**:
  - Creación del módulo `src/modules/pets/`.
  - Componente y página para el formulario de registro de especie con validación (`name` obligatorio, `description` opcional, acción cancelar y confirmación).
  - Servicio frontend de API para invocar el endpoint de registro de especies.
  - Integración de la pantalla de especies como pestaña dentro de `/catalogs`.

## Capabilities

### New Capabilities
- `species-catalog`: Capacidad para registrar y gestionar especies animales en el catálogo del Módulo 1 (HU-13), validando unicidad de nombre, requerimiento obligatorio de nombre y descripción opcional.

### Modified Capabilities

## Impact

- **Base de datos**: Nueva tabla `Species` / migración Prisma para el modelo de datos de catálogo de mascotas.
- **APIs**: Nuevo endpoint `POST /api/v1/pets/species`.
- **Frontend**: Nuevas páginas/componentes en `src/modules/pets/`, integrados en la pantalla de catálogos (`/catalogs`).
- **Permisos**: Utiliza el permiso existente `species:create` asignado al rol Veterinario y Administrador en `clinical.permissions.ts`.
