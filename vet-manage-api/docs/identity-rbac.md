# Identidad y RBAC

El backend separa los datos de la persona (`persons`) de la cuenta (`users`) y
controla el acceso con roles y permisos. La autenticación usa tokens JWT y dos
guards reutilizables por los demás módulos.

## Catálogos de permisos y roles

- `src/config/permissions.catalog.ts`: permisos del sistema, con claves
  `modulo:accion`, una por función.
- `src/config/roles.catalog.ts`: los 8 roles y sus permisos iniciales.
- `src/modules/identity/services/rbac-catalog-synchronizer.service.ts`:
  sincroniza ambos catálogos al arrancar la API.

La sincronización **solo crea lo que falta**. No modifica roles existentes, no
revoca asignaciones ni reactiva roles inactivos, de modo que los cambios que el
Administrador haga desde el sistema se conservan al reiniciar.

- Un rol nuevo recibe todos sus permisos del catálogo.
- Un permiso nuevo se concede a los roles que lo declaran, solo en el momento en
  que se crea.
- Un permiso que sale del catálogo se marca inactivo y sus asignaciones dejan de
  aplicarse. Si vuelve a declararse, se reactiva.

### Modo de sincronización

La variable `RBAC_SYNC_MODE` define quién manda sobre los roles del sistema:

- `create-only` (por defecto): lo descrito arriba; la base es del Administrador.
- `strict`: el catálogo manda. En cada arranque repone los datos de los roles del
  catálogo, los reactiva y deja sus asignaciones exactamente como están en el
  código (agrega las que faltan y revoca las que sobran). No toca los roles
  personalizados. Es el valor de `docker-compose.yml` en desarrollo, para que
  los cambios de permisos en el código se apliquen sin reiniciar la base.

Para agregar un permiso, añádelo a `PERMISSION_ENTRIES` y a los roles que
corresponda. Los cambios de estructura requieren una migración; los de
permisos solo reiniciar la API.

## Administrador inicial

Al arrancar, si ningún usuario tiene el rol Administrador, se crea la persona,
la cuenta activa y la asignación del rol con las variables `ADMIN_*`. Si la
persona ya existe por cédula, se reutiliza.

## Variables de entorno

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `JWT_SECRET` | sí | Secreto de firma, mínimo 32 caracteres. |
| `JWT_EXPIRES_IN` | no | Vigencia del token (`15m` por defecto; ejemplos: `1h`, `7d`). |
| `RBAC_SYNC_MODE` | no | `create-only` (por defecto) o `strict`. Ver arriba. |
| `ADMIN_EMAIL` | sí | Correo del Administrador inicial. |
| `ADMIN_PASSWORD` | sí | Mínimo 8 caracteres con mayúscula, minúscula y número. |
| `ADMIN_IDENTIFICATION` | sí | Cédula de 10 dígitos. |
| `ADMIN_FIRST_NAME`, `ADMIN_LAST_NAME` | sí | Nombres y apellidos. |

La API no arranca si falta alguna o es inválida. `docker-compose.yml` las
provee con valores de desarrollo; en producción deben definirse con valores
propios.

## Proteger una ruta

El módulo que protege rutas debe importar `IdentityModule`.

```ts
@Get()
@RequirePermissions('clients:read')
findAll() {}
```

- `@RequirePermissions(...)` exige sesión válida y todos los permisos indicados.
- `@Authenticated()` exige solo una sesión válida.
- Las rutas sin decorador son públicas.

Respuestas: `401` sin token, con token inválido o vencido, o con cuenta
inexistente o inactiva; `403` si falta algún permiso. Los permisos se consultan
en la base de datos en cada petición (roles activos y vigentes), por lo que un
cambio del Administrador aplica sin reiniciar ni reemitir tokens.

## Contrato de errores

Las excepciones usan este envelope:

```json
{
  "statusCode": 403,
  "success": false,
  "message": "Acceso denegado",
  "errors": [],
  "code": "FORBIDDEN",
  "traceId": "..."
}
```

El cliente frontend (`src/infrastructure/api/http-client.ts`) desenvuelve
`data` en respuestas exitosas y convierte los errores en `ApiError`, conservando
`code`, `errors` y `traceId`.
