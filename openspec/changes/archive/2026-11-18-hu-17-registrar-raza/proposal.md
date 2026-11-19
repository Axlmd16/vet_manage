## Why

El catálogo de especies (HU-13) ya permite registrar especies, pero todavía no existe forma de clasificar las razas dentro de cada especie. Sin razas no se puede registrar un paciente con precisión (HU-07). Este cambio implementa la HU-17 · Registrar raza (RF-17, issue #6): el Veterinario registra razas asociadas obligatoriamente a una especie activa.

## What Changes

- **Base de datos**: nuevo modelo `Breed` en `prisma/schema/pets.prisma` (UUID, nombre, descripción opcional, estado activo, especie asociada y timestamps) con relación obligatoria a `Species` y su migración.
- **Backend (`vet-manage-api/`, módulo `pets`)**:
  - Endpoint `POST /api/v1/pets/breeds` protegido con JWT y el permiso `breeds:create`.
  - Endpoint `GET /api/v1/pets/species/active` protegido con el permiso `species:read`, que devuelve solo las especies activas para poblar el selector (también lo reutilizará HU-07).
  - Validaciones: nombre obligatorio, especie obligatoria, especie existente y activa, nombre de raza único dentro de la misma especie sin distinguir mayúsculas.
  - Pruebas unitarias de los servicios y pruebas e2e de ambos endpoints.
- **Frontend (`vet-manage-frontend/`, módulo `pets`)**:
  - La pestaña «Razas» de `/catalogs` deja de ser un marcador «próximamente» y muestra la pantalla de razas con el botón «Nueva raza».
  - Formulario modal con nombre (obligatorio), selector de especie (solo activas, obligatorio), descripción (opcional), «Cancelar» y «Guardar» con mensaje de confirmación.
  - Pruebas del formulario con vitest.
- **Seed**: razas demo para las especies demo, siguiendo el patrón de `species.seed.ts`.

## Capabilities

### New Capabilities
- `breed-catalog`: registro de razas asociadas a una especie activa del catálogo, sus validaciones, la consulta de especies activas para la asociación y el control de acceso correspondiente.

### Modified Capabilities

## Impact

- **Base de datos**: nueva tabla `breeds` con clave foránea a `species`; migración `add_breed_model`. Solo una persona debe cambiar el esquema a la vez, así que hay que avisar al equipo antes de generarla.
- **APIs**: nuevos `POST /api/v1/pets/breeds` y `GET /api/v1/pets/species/active`.
- **Permisos**: usa `breeds:create` y `species:read`, que ya existen en `clinical.permissions.ts` y están asignados al Veterinario y al Administrador; no se agregan permisos.
- **Dependencias**: se construye sobre HU-13 (modelo `Species`, `SpeciesRepository`, módulo `pets`). La rama debe partir de `development` después del merge de HU-13, o de la rama de HU-13 mientras ese PR siga abierto.
