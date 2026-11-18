## ADDED Requirements

### Requirement: Registro de nueva especie animal
El sistema SHALL permitir al usuario con permisos de gestión clínica (Veterinario o Administrador con permiso `species:create`) registrar una nueva especie animal en el catálogo del sistema.

#### Scenario: Registro exitoso de una especie con datos completos
- **WHEN** el usuario autenticado con permiso `species:create` envía una solicitud de registro con un nombre válido (ej. "Canino") y una descripción (ej. "Perros domésticos y silvestres")
- **THEN** el sistema registra la especie en la base de datos con un identificador UUID, estado activo por defecto (`isActive: true`), timestamps de creación/actualización y responde con HTTP 201 y el recurso creado en el envelope estándar.

#### Scenario: Registro exitoso de una especie sin descripción
- **WHEN** el usuario autenticado con permiso `species:create` envía una solicitud con nombre válido pero omitiendo el campo de descripción (o enviándolo vacío)
- **THEN** el sistema SHALL aceptar la solicitud, registrar la especie con descripción nula/vacía y retornar HTTP 201 y la especie registrada.

### Requirement: Validación de datos de especie
El sistema SHALL validar los campos requeridos y restricciones de integridad en el registro de especies.

#### Scenario: Validación de nombre obligatorio
- **WHEN** el usuario intenta registrar una especie con el campo de nombre vacío, nulo o compuesto únicamente de espacios en blanco
- **THEN** el sistema SHALL rechazar la solicitud con código de error HTTP 400 (Bad Request), detallando que el nombre es obligatorio.

#### Scenario: Validación de unicidad de nombre de especie
- **WHEN** el usuario intenta registrar una especie cuyo nombre (insensible a mayúsculas/minúsculas) ya existe en el catálogo
- **THEN** el sistema SHALL rechazar la operación con un error HTTP 409 (Conflict) indicando que ya existe una especie registrada con ese nombre.

### Requirement: Control de acceso para registro de especies
El sistema SHALL exigir autenticación y el permiso correspondiente para la creación de especies.

#### Scenario: Intento de registro sin autenticación
- **WHEN** un cliente no autenticado realiza una petición de registro a `POST /api/v1/pets/species`
- **THEN** el sistema SHALL responder con código HTTP 401 (Unauthorized).

#### Scenario: Intento de registro sin permisos requeridos
- **WHEN** un usuario autenticado sin el permiso `species:create` realiza una petición a `POST /api/v1/pets/species`
- **THEN** el sistema SHALL responder con código HTTP 403 (Forbidden).
