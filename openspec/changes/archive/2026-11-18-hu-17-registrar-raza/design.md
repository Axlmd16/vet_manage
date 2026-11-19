## Context

HU-13 dejó listo el módulo `pets` en el backend (`SpeciesController`, `RegisterSpeciesService`, `SpeciesRepository`, modelo `Species` en `prisma/schema/pets.prisma`) y en el frontend (`SpeciesPage` como pestaña de `/catalogs`, `schemas/species.ts`, `services/species.service.ts`). HU-13 decidió no exponer `GET /pets/species`, así que hoy no hay forma de obtener especies para un selector. La pestaña «Razas» de `/catalogs` muestra un `ComingSoonCatalog`.

La HU-17 exige seleccionar únicamente especies con estado «Activa» (Escenario 4), por lo que el formulario necesita una lista de especies activas y el backend debe rechazar especies inactivas aunque el cliente las envíe.

## Goals / Non-Goals

**Goals:**
- Modelo `Breed` relacionado con `Species` y su migración.
- `POST /api/v1/pets/breeds` con un servicio por operación (`RegisterBreedService`).
- `GET /api/v1/pets/species/active` con su propio servicio (`ListActiveSpeciesService`), mínimo y reutilizable por HU-07.
- Pestaña «Razas» funcional con formulario modal, siguiendo el mismo patrón visual que especies.

**Non-Goals:**
- Listar, consultar, actualizar o activar/inactivar razas (HU-18, HU-19 y la consulta de razas).
- Consulta general de especies con filtros (HU-16): el endpoint de activas solo devuelve `id` y `name`, sin búsqueda ni paginación.
- Mostrar un listado de razas registradas en la pestaña; se mantiene un estado vacío informativo como en especies.

## Decisions

### 1. Modelo `Breed` en `pets.prisma`
- **Decisión**: `Breed { id UUID, name VarChar(100), description Text?, isActive Boolean @default(true), speciesId UUID, createdAt, updatedAt }`, relación `species Species @relation(fields: [speciesId], references: [id], onDelete: Restrict)`, `@@unique([speciesId, name])`, `@@index([speciesId, isActive])`, mapeado a la tabla `breeds` y columnas snake_case.
- **Justificación**: la unicidad es por especie (puede existir «Mestizo» en Canino y en Felino). `Restrict` evita borrar especies con razas; el ciclo de vida se maneja con `isActive`, no con borrados.
- **Alternativa descartada**: nombre único global, que bloquearía nombres legítimos repetidos entre especies.

### 2. Unicidad sin distinguir mayúsculas
- **Decisión**: `BreedRepository.findByNameInSpecies(speciesId, name)` con `mode: 'insensitive'` antes de crear; el índice único de base de datos queda como respaldo y un `P2002` se traduce también a 409.
- **Justificación**: es el mismo criterio que HU-13 aplica a especies.

### 3. Validación de la especie en el servicio
- **Decisión**: `RegisterBreedService` usa `SpeciesRepository.findById`. Si no existe responde 404 («La especie seleccionada no existe»); si está inactiva responde 409 («La especie seleccionada está inactiva»). `speciesId` vacío o que no sea UUID se rechaza con 400 en el DTO (`@IsNotEmpty`, `@IsUUID`).
- **Justificación**: el selector del frontend ya filtra activas, pero el backend debe ser la fuente de verdad.
- **Alternativa descartada**: 400 para especie inactiva; se prefiere 409 porque el dato es válido, pero el estado actual del recurso no lo permite.

### 4. Endpoint de especies activas
- **Decisión**: `GET /api/v1/pets/species/active` en `SpeciesController`, protegido con `species:read`, que responde `[{ id, name }]` ordenado por nombre.
- **Justificación**: el Veterinario y el Administrador tienen `species:read`; la Recepcionista también lo tiene, así que HU-07 podrá reutilizarlo para registrar pacientes. Una ruta separada no interfiere con el `GET /pets/species` que defina HU-16.
- **Alternativa descartada**: `GET /pets/breeds/species-options` con `breeds:create`, que acoplaría la consulta de especies al catálogo de razas y no serviría para HU-07.

### 5. Estructura de archivos
- Backend: `dtos/breeds/register-breed.dto.ts`, `repositories/breed.repository.ts`, `services/breeds/register-breed.service.ts` (+ `.spec.ts`), `services/species/list-active-species.service.ts` (+ `.spec.ts`), `routes/breed.controller.ts`; registrar todo en `pets.module.ts`; e2e en `test/pets/breeds.e2e-spec.ts`.
- Frontend: `schemas/breed.ts`, `services/breed.service.ts`, `services/species.service.ts` (agrega `listActiveSpecies`), `components/breed-form.tsx` (+ `.test.tsx`), `pages/breeds-page.tsx`, tipos en `types.ts`; `catalogs-page.tsx` monta `BreedsPage` en la pestaña `breeds`.
- Mensajes de UI en español y código en inglés, como el resto del módulo.

### 6. Comportamiento del formulario
- El selector carga las especies activas al abrir el modal. Si no hay especies activas, muestra un aviso y deshabilita «Guardar».
- La validación del cliente (`validateBreedDraft`) recorta espacios, exige nombre y especie, y envía `description` solo si no está vacía.
- «Cancelar», la tecla Escape y el clic fuera cierran el modal sin enviar nada.

## Risks / Trade-offs

- **[HU-13 aún no está en `development`]** → La rama parte de la de HU-13. Si HU-13 cambia antes del merge, se sincroniza `development` y se resuelven conflictos antes de abrir el PR de HU-17.
- **[Migraciones concurrentes]** → Avisar al equipo antes de `npx prisma migrate dev --name add_breed_model`; la migración solo agrega una tabla y no toca `species`.
- **[Especie inactivada mientras el formulario está abierto]** → El backend responde 409, el formulario muestra el mensaje y recarga las especies activas.
- **[Carrera entre dos registros con el mismo nombre]** → El índice único `(species_id, name)` hace de respaldo; los nombres que solo difieren en mayúsculas los cubre la verificación previa.

## Migration Plan

1. `npx prisma migrate dev --name add_breed_model` y `npx prisma generate` dentro de `vet-manage-api`.
2. Despliegue normal con `make up`; `make up-seed` carga las razas demo.
3. Rollback: revertir la migración y eliminar la tabla `breeds`, que no tiene dependientes todavía.
