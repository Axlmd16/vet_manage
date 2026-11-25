## 1. Backend – Búsqueda y filtro

- [ ] 1.1 Mover la generación de variantes sin tildes a `src/modules/pets/services/search-variants.ts` (sin cambiar su comportamiento) y actualizar su uso en pacientes; sus pruebas siguen pasando.
- [ ] 1.2 Crear `src/modules/pets/dtos/breeds/list-breeds-query.dto.ts` (`search` ≤ 100, `speciesId` UUID, con los mensajes de la spec).
- [ ] 1.3 Agregar a `BreedRepository` la consulta con filtros combinables (`search` por variantes, `speciesId`), incluyendo activas e inactivas y orden por nombre.
- [ ] 1.4 Crear `src/modules/pets/services/breeds/find-breeds.service.ts` y usarlo en `GET /pets/breeds`, devolviendo el mensaje «No se encontraron razas con el criterio ingresado» cuando la lista está vacía.

## 2. Backend – Detalle

- [ ] 2.1 Exponer `GET /pets/breeds/:id` con `ParseUUIDPipe`, `@RequirePermissions('breeds:read')` y `404 "Raza no encontrada"`, sin interferir con `species/:speciesId/breeds`.

## 3. Pruebas de backend

- [ ] 3.1 `find-breeds.service.spec.ts` con casos positivos, negativos y de valor límite (búsqueda vacía, de 1, 100 y 101 caracteres): sin filtros, búsqueda parcial, sin mayúsculas ni tildes, filtro por especie, combinación, sin resultados, búsqueda de 100/101 caracteres y especie inválida.
- [ ] 3.2 `breed.controller.spec.ts`: filtros, detalle, 404, 400 por id inválido y permiso `breeds:read`; prueba de `roles.catalog` que verifica que el Administrador no tiene permisos `breeds:*`.
- [ ] 3.3 Prueba e2e en `test/pets/breeds.e2e-spec.ts`: consulta con Cajero (`403`) y verificación de que buscar y ver el detalle no agregan filas a `audit_logs`.

## 4. Frontend – Consulta en `BreedsPage`

- [ ] 4.1 Agregar `listBreeds({ search, speciesId })` y `getBreed(id)` en `src/modules/pets/services/breed.service.ts` y `types.ts`, con su prueba.
- [ ] 4.2 En `breeds-page.tsx`: campo de búsqueda con espera de 300 ms, filtro «Todas las especies» + especies (inactivas marcadas) y mensaje de sin resultados.
- [ ] 4.3 Panel de detalle de solo lectura (nombre, especie, descripción o «Sin descripción», estado «Activa»/«Inactiva»), manteniendo la edición de HU-18 solo con `breeds:update`.
- [ ] 4.4 Pruebas en `breeds-page.test.tsx` (positivos, negativos y valor límite): búsqueda, limpieza, filtro, combinación, sin resultados, detalle y aviso sin permiso.

## 5. Verificación final

- [ ] 5.1 Ejecutar `docker compose exec -T api sh -c 'npm test && npm run lint && npx tsc -p tsconfig.build.json --noEmit'` y `docker compose exec -T frontend sh -c 'npm test && npm run lint && npm run build'`.
