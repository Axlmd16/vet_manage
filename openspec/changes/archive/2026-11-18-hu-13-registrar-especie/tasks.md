## 1. Modelo de datos y persistencia

- [x] 1.1 Crear el archivo de esquema `vet-manage-api/prisma/schema/pets.prisma` con el modelo `Species` (id UUID, name único, description opcional, isActive booleano con default true, createdAt y updatedAt).
- [x] 1.2 Generar y validar el cliente Prisma y la migración correspondiente para `Species`.

## 2. Backend - Módulo de Mascotas (`pets`)

- [x] 2.1 Crear la estructura de carpetas en `vet-manage-api/src/modules/pets/` (`dtos/species/`, `repositories/`, `services/species/`, `routes/`).
- [x] 2.2 Implementar el DTO `RegisterSpeciesDto` con validaciones de `class-validator` (`@IsNotEmpty`, `@IsString`, `@IsOptional`).
- [x] 2.3 Implementar el repositorio `SpeciesRepository` para operaciones CRUD/búsqueda por nombre de especies.
- [x] 2.4 Implementar el servicio `RegisterSpeciesService` (HU-13) con validación de unicidad de nombre y creación de la especie.
- [x] 2.5 Implementar las pruebas unitarias en `RegisterSpeciesService.spec.ts`.
- [x] 2.6 Implementar el controlador `SpeciesController` en `routes/species.controller.ts` con endpoint `POST /api/v1/pets/species`, protegido con `JwtAuthGuard` y `@RequirePermissions('species:create')`.
- [x] 2.7 Registrar `PetsModule` y agregarlo en `vet-manage-api/src/app.module.ts`.
- [x] 2.8 Agregar pruebas de integración e2e en `vet-manage-api/test/pets/species.e2e-spec.ts`.

## 3. Frontend - Módulo de Mascotas (`pets`)

- [x] 3.1 Crear la estructura de carpetas en `vet-manage-frontend/src/modules/pets/` (`pages/`, `components/`, `services/`, `types/`, `schemas/`).
- [x] 3.2 Implementar tipos y el esquema de validación estándar en `schemas/species.ts` para el registro de especies.
- [x] 3.3 Implementar el servicio API `species.service.ts` para comunicarse con `POST /api/v1/pets/species`.
- [x] 3.4 Implementar el componente/página del formulario de registro de especie con campos para nombre (obligatorio), descripción (opcional), botón Cancelar y botón Guardar con feedback visual de éxito/error.
- [x] 3.5 Integrar la pantalla de especies como pestaña dentro de `/catalogs` en `vet-manage-frontend/src/modules/catalogs/pages/catalogs-page.tsx`.
- [x] 3.6 Agregar pruebas unitarias del formulario en `vet-manage-frontend/src/modules/pets/components/species-form.test.tsx` (validación de nombre, normalización del envío y cancelación).

## 4. Verificación integral

- [x] 4.1 Ejecutar `npm run build` y `npm run test` en backend y frontend para verificar que compilan y pasan pruebas.
- [x] 4.2 Probar los 4 criterios de aceptación de la HU-13 (registro exitoso, validación de nombre, registro sin descripción, cancelación).
