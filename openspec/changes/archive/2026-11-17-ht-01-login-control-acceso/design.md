## Context

`IdentityModule` solo contiene `RbacCatalogSynchronizer`. Este corre en cada arranque, con los catálogos de `src/config`, y sobrescribe roles, revoca asignaciones y reactiva roles. Eso anula cualquier cambio que el Administrador haga desde el sistema (HU-56). El catálogo actual tiene 18 permisos y 4 roles, y no coincide con la matriz de roles y permisos del Módulo I.

`Person` y `User` ya están separados. `UserRole` tiene `expiresAt` y `Role` y `Permission` tienen `isActive`. `ApiException` y `GlobalExceptionFilter` ya definen el contrato de errores.

## Goals / Non-Goals

**Goals:**
- Catálogos de permisos y roles alineados con la matriz.
- Sincronización que no pisa cambios del Administrador.
- Administrador inicial, hash de contraseñas, JWT y guards reutilizables.

**Non-Goals:**
- Endpoint de inicio de sesión, bloqueo por intentos y mensajes (HU-57).
- Refresh tokens y uso de la tabla `user_sessions`.
- Registro de usuarios, asignación de roles y pantalla de permisos (HU-51, HU-54, HU-56).

## Decisions

### Claves de permisos
Una clave `modulo:accion` por fila de la matriz. Las filas que combinan acciones se dividen solo cuando se consultan y exportan por separado.

| Dominio | Claves |
| --- | --- |
| users | `users:create`, `users:read`, `users:update`, `users:assign-roles`, `users:change-status`, `users:deactivate` |
| roles | `roles:manage-permissions` |
| audit | `audit:read`, `audit:export` |
| clients | `clients:create`, `clients:read`, `clients:update`, `clients:deactivate`, `clients:inactivate`, `clients:activate` |
| pets | `pets:create`, `pets:read`, `pets:update`, `pets:deactivate`, `pets:inactivate`, `pets:activate` |
| species / breeds | `species:create`, `species:read`, `species:update`, `species:change-status` y lo mismo para `breeds` |
| medical-history | `medical-history:create`, `medical-history:read`, `consultations:create`, `consultations:correct`, `diagnoses:create` |
| prescriptions | `prescriptions:manage`, `prescriptions:read`, `prescriptions:export` |
| preventive-care | `vaccinations:create`, `:update`, `:read`, `:void` y lo mismo para `deworming` |
| procedures | `procedure-types:create`, `:read`, `:inactivate`; `procedures:create`, `:read`, `:deactivate`; `procedure-reports:create`, `procedure-reports:correct` |
| supplies | `supplies-used:create`, `supplies-used:remove` |
| clinical-files | `clinical-files:create`, `:read`, `:update`, `:remove` |

Los nombres de estado siguen `RecordStatus`: `deactivate` es dar de baja e `inactivate` es inactivar. Ver, visualizar y descargar archivos son parte de `read`, como indica la matriz.

Los permisos de otros módulos (Inventario y Ventas) los agrega su grupo con la misma convención.

### Sincronización solo de creación
Se reescribe `RbacCatalogSynchronizer` con esta lógica, dentro de una transacción:
1. Crear los permisos que faltan. Marcar inactivos los activos que ya no están en el catálogo.
2. Crear los roles que faltan.
3. Para cada permiso o rol **recién creado**, conceder las asignaciones que el catálogo declara. Para esto se usa un conjunto de roles y permisos creados en esa ejecución; si ninguno es nuevo, no se toca la tabla de asignaciones.

En desarrollo, `RBAC_SYNC_MODE=strict` hace que el catálogo mande sobre los roles del sistema (repone datos y asignaciones, sin tocar roles personalizados), para que cada módulo ajuste permisos en código sin reiniciar la base.

Alternativa descartada: guardar una marca de "sembrado" en una tabla nueva. Añade esquema y migración; el conjunto de recién creados lleva a lo mismo sin tabla.

Los roles `isSystem` ya no se desactivan cuando salen del catálogo, porque el Administrador es dueño de su estado.

### Administrador inicial
`InitialAdminService` corre en `onModuleInit` después del sincronizador (se invoca desde el mismo orquestador para fijar el orden). Si no hay un `UserRole` con el rol `administrator`, crea en una transacción: `Person` (reusa la existente por cédula), `User` con `status ACTIVE` y la contraseña con hash, y el `UserRole`.

Las variables `ADMIN_*` se validan en `env.validation.ts` con la misma política de contraseña y 10 dígitos para la cédula.

### Contraseñas
`PasswordHasher` usa `scrypt` de `node:crypto` con sal aleatoria de 16 bytes y formato `scrypt$N$r$p$salt$hash` para poder cambiar parámetros después. Compara con `timingSafeEqual`. Alternativa descartada: `argon2` o `bcrypt`, que necesitan binarios nativos en la imagen Alpine. La política de formato vive en el mismo servicio.

### Token y guards
- `TokenService` envuelve `@nestjs/jwt` con `JWT_SECRET` y `JWT_EXPIRES_IN`. El payload lleva solo `sub`. No se guardan permisos en el token, para que los cambios del Administrador apliquen sin esperar a que venza.
- `JwtAuthGuard` lee `Authorization: Bearer`, valida el token, carga el usuario con su persona y rechaza con 401 si no existe o no está `ACTIVE`. Deja el usuario en `request.user`.
- `PermissionsGuard` lee los permisos requeridos de los metadatos de la ruta y consulta en cada petición los permisos del usuario: asignaciones sin vencer, rol activo, permiso activo. Rechaza con 403 si falta alguno.
- `@RequirePermissions(...keys)` aplica ambos guards y fija los metadatos con `applyDecorators`. Las rutas sin el decorador siguen públicas, por eso los guards no son globales.
- Cada consulta de permisos va a la base de datos. Alternativa descartada: caché en Redis; se evalúa cuando haya carga real, porque agrega invalidación.

### Variables de entorno
| Variable | Obligatoria | Valor por defecto |
| --- | --- | --- |
| `JWT_SECRET` | sí, mínimo 32 caracteres | ninguno en la API |
| `JWT_EXPIRES_IN` | no | `15m` |
| `RBAC_SYNC_MODE` | no | `create-only`; Docker Compose usa `strict` en desarrollo |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD, `ADMIN_IDENTIFICATION`, `ADMIN_FIRST_NAME`, `ADMIN_LAST_NAME` | sí | ninguno en la API |

`docker-compose.yml` pasa estas variables a la API con valores de desarrollo por defecto, para que `docker compose up` siga funcionando sin editar `.env`. En producción se definen con valores propios. Se documentan en `.env.example` y en `vet-manage-api/docs/identity-rbac.md`. No cambian puertos ni el comando de arranque (`prisma migrate deploy`, `prisma generate`, `npm run start:dev`).

## Risks / Trade-offs

- [Las especificaciones del cambio `add-rbac-identity-models` aún describen la sincronización que revoca y sobrescribe] → Se reemplazan al archivar este cambio; se indica en el pull request.
- [Un permiso nuevo del catálogo no llega a un rol que el Administrador ya modificó, si el rol ya existía] → Es intencional: solo se concede al crear el permiso, y el Administrador lo ajusta desde HU-56.
- [Una consulta de permisos por petición] → Es una consulta indexada por usuario; se mide antes de agregar caché.
- [Contraseña del Administrador en variables de entorno] → Aceptable en desarrollo. En producción se cambia desde el sistema en el primer ingreso (HU-59).
- [Reiniciar con un `ADMIN_*` distinto no crea otro Administrador] → Es lo esperado; solo se crea si no existe ninguno.

## Migration Plan

Sin migración de base de datos. Al desplegar, definir las variables nuevas. En bases existentes, los permisos antiguos (`pets:read`, `appointments:*`, etc.) que no estén en el catálogo quedan inactivos y los nuevos se crean y asignan. Para volver atrás basta con revertir el commit; los registros creados quedan sin efecto.

## Open Questions

- Los permisos de Inventario y Ventas (Cajero y Bodeguero) se definen con el Grupo 3.
