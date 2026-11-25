## MODIFIED Requirements

### Requirement: Listado general de razas registradas
El sistema SHALL permitir al usuario autenticado con permiso `breeds:read` consultar el listado de razas registradas mediante `GET /api/v1/pets/breeds`. El listado SHALL aceptar los filtros opcionales y combinables `search` (coincidencia parcial con el nombre, sin distinguir mayúsculas ni tildes, ignorando espacios al inicio y al final, máximo 100 caracteres) y `speciesId` (UUID de una especie). Sin filtros SHALL devolver todas las razas. El resultado SHALL incluir razas activas e inactivas, ordenadas alfabéticamente por nombre, con `id`, `name`, `description`, `isActive`, `speciesId` y `species: { id, name }`. Consultar razas SHALL NOT crear registros de auditoría.

#### Scenario: Consulta de listado de razas
- **WHEN** un usuario con permiso `breeds:read` solicita `GET /api/v1/pets/breeds`
- **THEN** el sistema devuelve HTTP `200` con las razas ordenadas alfabéticamente por nombre, incluyendo `id`, `name`, `description`, `isActive`, `speciesId` y `species: { id, name }`

#### Scenario: Búsqueda por nombre
- **WHEN** un Veterinario solicita `GET /api/v1/pets/breeds?search=labra`
- **THEN** el sistema devuelve las razas cuyo nombre contiene "labra", por ejemplo "Labrador Retriever"

#### Scenario: Búsqueda sin mayúsculas ni tildes
- **WHEN** un Recepcionista busca `search=SIAMES`
- **THEN** el sistema devuelve la raza "Siamés"

#### Scenario: Filtro por especie
- **WHEN** un Técnico Veterinario solicita `GET /api/v1/pets/breeds?speciesId=<id de Felino>`
- **THEN** el sistema devuelve únicamente las razas asociadas a Felino

#### Scenario: Búsqueda y filtro combinados
- **WHEN** un Gerente solicita `search=mestizo&speciesId=<id de Canino>`
- **THEN** el sistema devuelve solo "Mestizo" de Canino y no "Mestizo" de Felino

#### Scenario: Sin resultados
- **WHEN** ninguna raza coincide con los filtros
- **THEN** el sistema devuelve HTTP `200` con una lista vacía y el mensaje `"No se encontraron razas con el criterio ingresado"`

#### Scenario: Filtro de especie inválido
- **WHEN** `speciesId` no es un UUID
- **THEN** el sistema devuelve HTTP `400` con `"Especie no válida"`

#### Scenario: Búsqueda demasiado larga
- **WHEN** `search` tiene más de 100 caracteres
- **THEN** el sistema devuelve HTTP `400` con `"La búsqueda no puede superar 100 caracteres"`

#### Scenario: La consulta no se audita
- **WHEN** un usuario busca o filtra razas
- **THEN** no se crea ningún registro en la auditoría

## ADDED Requirements

### Requirement: Detalle de una raza
El sistema SHALL permitir al usuario autenticado con permiso `breeds:read` consultar una raza mediante `GET /api/v1/pets/breeds/:id`, devolviendo su nombre, la especie asociada, la descripción y el estado. La consulta SHALL NOT crear registros de auditoría.

#### Scenario: Consulta del detalle
- **WHEN** un Veterinario solicita `GET /api/v1/pets/breeds/:id` de "Labrador Retriever"
- **THEN** el sistema devuelve HTTP `200` con `{ id, name: "Labrador Retriever", description, isActive, species: { id, name: "Canino" } }`

#### Scenario: Raza inexistente
- **WHEN** el `id` no corresponde a ninguna raza
- **THEN** el sistema devuelve HTTP `404` con `"Raza no encontrada"`

#### Scenario: Identificador inválido
- **WHEN** el `id` no es un UUID
- **THEN** el sistema devuelve HTTP `400`

### Requirement: Permiso de consulta de razas
El listado y el detalle de razas SHALL requerir sesión y el permiso `breeds:read`.

#### Scenario: Usuario sin permiso
- **WHEN** un Cajero o un Bodeguero consulta `GET /api/v1/pets/breeds` o el detalle de una raza
- **THEN** el sistema devuelve HTTP `403` con `"No tiene permisos para realizar esta acción"`

#### Scenario: Sin sesión
- **WHEN** la petición no tiene un token válido
- **THEN** el sistema devuelve HTTP `401`
