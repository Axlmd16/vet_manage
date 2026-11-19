## Why

La base de identidad ya tiene los modelos de usuarios, roles y permisos, pero no hay forma de autenticar una petición ni de restringirla por permiso. Además, el sincronizador actual vuelve a escribir el catálogo en cada arranque y borra los permisos que el Administrador edite desde el sistema. Hay que resolver ambas cosas antes de que las demás historias dependan de roles y permisos.

## What Changes

- Reemplazar el catálogo de permisos por uno basado en la matriz de roles y permisos del Módulo I, con una clave `modulo:accion` por función.
- Definir los 8 roles del sistema (Administrador, Gerente, Veterinario, Técnico Veterinario, Recepcionista, Cajero, Bodeguero y Cliente) con los permisos iniciales de la matriz. Se elimina el rol `super_admin`.
- **BREAKING**: cambiar el sincronizador para que solo cree lo que falta. Ya no actualiza roles existentes, no revoca asignaciones ni reactiva roles inactivos. Las asignaciones por defecto se conceden únicamente cuando se crea el rol o el permiso.
- Crear el Administrador inicial al arrancar, a partir de variables de entorno, si no existe ningún usuario con ese rol.
- Agregar el hash de contraseñas con `scrypt` y la validación de su formato.
- Generar y validar tokens JWT con tiempo de expiración.
- Agregar un guard de autenticación que verifica en cada petición que el usuario exista y esté activo, y un guard de permisos con el decorador `@RequirePermissions` que consulta los permisos vigentes en la base de datos.
- **BREAKING**: la API exige las variables `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_IDENTIFICATION`, `ADMIN_FIRST_NAME` y `ADMIN_LAST_NAME`; sin ellas no arranca. Docker Compose las provee con valores de desarrollo.

Fuera de alcance: el endpoint de inicio de sesión, el bloqueo por intentos fallidos y los mensajes al usuario (HU-57).

## Capabilities

### New Capabilities
- `rbac-catalog`: catálogo de permisos y roles del sistema y su sincronización con la base de datos sin pisar los cambios del Administrador.
- `initial-admin`: creación del Administrador inicial desde variables de entorno.
- `access-control`: hash de contraseñas, tokens de sesión y guards de autenticación y permisos.

### Modified Capabilities

## Impact

- Código: `vet-manage-api/src/config` (catálogos y validación de entorno), `src/modules/identity` (servicios, guards, decorador), `src/common/errors` (se reutiliza `ApiException`).
- Dependencias: se agrega `@nestjs/jwt`.
- Configuración: nuevas variables en `.env.example` y en `docker-compose.yml`.
- Base de datos: sin cambios de estructura.
- Otros dominios: usarán `@RequirePermissions` y los guards exportados por `IdentityModule`.
