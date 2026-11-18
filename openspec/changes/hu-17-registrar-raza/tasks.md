## 1. Modelo de datos

- [x] 1.1 Agregar el modelo `Breed` y la relación inversa `breeds Breed[]` en `Species` dentro de `vet-manage-api/prisma/schema/pets.prisma` (UUID, `name` VarChar(100), `description` opcional, `isActive` default true, `speciesId` con `onDelete: Restrict`, `@@unique([speciesId, name])`, `@@index([speciesId, isActive])`, tabla `breeds`). Verificar con `npx prisma validate`.
- [x] 1.2 Avisar al equipo y generar la migración `add_breed_model` y el cliente Prisma. Verificar que `prisma/migrations/*_add_breed_model/migration.sql` crea solo la tabla `breeds` y su FK, y que `npm run build` compila.
- [x] 1.3 Crear `seed/breeds.seed.ts` (razas demo por especie demo, con upsert idempotente), invocarlo desde `seed/index.ts` después de especies y cubrirlo con `seed/breeds.seed.spec.ts`. Verificar con `npm run test -- breeds.seed`.

## 2. Backend: especies activas

- [x] 2.1 Agregar `findActive()` a `SpeciesRepository` (solo `isActive: true`, `select { id, name }`, orden por nombre) y crear `services/species/list-active-species.service.ts` con su `.spec.ts`. Verificar con la prueba unitaria.
- [x] 2.2 Exponer `GET /api/v1/pets/species/active` en `SpeciesController` con `JwtAuthGuard`, `PermissionsGuard` y `@RequirePermissions('species:read')`. Verificar con e2e: 200 solo con activas y ordenadas, lista vacía sin activas, 401 sin token.

## 3. Backend: registro de raza

- [x] 3.1 Crear `dtos/breeds/register-breed.dto.ts` (`name` obligatorio, máximo 100; `speciesId` obligatorio y `@IsUUID`; `description` opcional) con mensajes en español. Verificar con la e2e de 400.
- [x] 3.2 Crear `repositories/breed.repository.ts` con `findByNameInSpecies(speciesId, name)` sin distinguir mayúsculas y `create(...)` que recorta nombre y descripción.
- [x] 3.3 Crear `services/breeds/register-breed.service.ts`: nombre recortado obligatorio (400), especie inexistente (404), especie inactiva (409), duplicado en la especie (409, también ante `P2002`). Cubrir cada caso en `register-breed.service.spec.ts`.
- [x] 3.4 Crear `routes/breed.controller.ts` con `POST /api/v1/pets/breeds`, `JwtAuthGuard`, `PermissionsGuard`, `@RequirePermissions('breeds:create')` y respuesta 201 «Raza registrada exitosamente». Registrar controlador, repositorio y servicios en `pets.module.ts`.
- [x] 3.5 Agregar `test/pets/breeds.e2e-spec.ts`: 201 completo y sin descripción, 400 sin nombre o sin especie, 404 especie inexistente, 409 especie inactiva, 409 duplicado sin distinguir mayúsculas, 201 mismo nombre en otra especie, 401 y 403. Verificar con `npm run test:e2e -- breeds`.

## 4. Frontend: pantalla de razas

- [ ] 4.1 Agregar los tipos `Breed`, `RegisterBreedDraft` y `SpeciesOption` en `src/modules/pets/types.ts` y crear `schemas/breed.ts` con `validateBreedDraft` (nombre y especie obligatorios, descripción vacía omitida).
- [ ] 4.2 Agregar `listActiveSpecies()` en `services/species.service.ts` y crear `services/breed.service.ts` con `registerBreed()`.
- [ ] 4.3 Crear `components/breed-form.tsx`: nombre, selector de especies activas, descripción, «Cancelar» y «Guardar»; aviso y «Guardar» deshabilitado cuando no hay especies activas.
- [ ] 4.4 Crear `pages/breeds-page.tsx` con el botón «Nueva raza», el modal (cierre con Escape y clic fuera), la carga de especies activas al abrir y un toast de éxito o error; ante un 409 por especie inactiva, recargar las especies.
- [ ] 4.5 Reemplazar el `ComingSoonCatalog` de la pestaña `breeds` en `modules/catalogs/pages/catalogs-page.tsx` por `BreedsPage`. Verificar abriendo `/catalogs` → «Razas».
- [ ] 4.6 Agregar `components/breed-form.test.tsx`: error sin nombre, error sin especie, solo especies activas en el selector, envío normalizado y cancelación sin envío. Verificar con `npm run test` en el frontend.

## 5. Verificación integral

- [ ] 5.1 Ejecutar `npm run build`, `npm run lint` y `npm run test` en `vet-manage-api` y `vet-manage-frontend` sin errores.
- [ ] 5.2 Recorrer en la app (`make up-seed`) los 6 escenarios de aceptación de HU-17 con el usuario Veterinario y confirmar que la Recepcionista recibe 403 al registrar.

## Workflow follow-up

- Sincronizar `development` en la rama `feature/modulo1/HU-17-registrar-raza` (después del merge de HU-13) antes de abrir el PR hacia `upstream/development`.
- Archivar el cambio con `/opsx:archive` y sincronizar la spec `breed-catalog`.
