## Context

HT-01 dejó listos `PasswordHasher`, `TokenService` (JWT con `sub`, 15 minutos por defecto), `JwtAuthGuard`, `PermissionsGuard`, `@Authenticated()` y `@RequirePermissions()`. `User` ya tiene `status`, `isLocked`, `lockedAt` y `mustChangePassword`, y el correo está en `Person`, único y obligatorio. No existe ningún controlador en `identity` ni pantalla de inicio de sesión; el frontend muestra un usuario de demostración fijo.

## Goals / Non-Goals

**Goals:**
- Endpoint de inicio de sesión con los mensajes y el bloqueo de la HU.
- Perfil de la sesión con roles y permisos para armar el menú.
- Pantalla de inicio de sesión, rutas protegidas, cierre de sesión y menú por permisos.

**Non-Goals:**
- Pantalla de cambio obligatorio de contraseña (HU-59); solo se devuelve el indicador.
- Auditoría de inicios de sesión (HU-60).
- Ocultar botones de acción dentro de cada pantalla; cada módulo lo hace con los permisos del perfil.

## Decisions

### Endpoints
`AuthController` en `src/modules/identity` con:
- `POST /auth/login` (público): cuerpo `{ email, password }`. Responde `{ accessToken, mustChangePassword, user }` y fija la cookie de sesión.
- `POST /auth/refresh` (cookie): rota el refresh token y responde lo mismo que el login.
- `POST /auth/logout` (cookie): revoca la sesión y borra la cookie.
- `GET /auth/me` (`@Authenticated()`): responde `user` y `mustChangePassword` leídos de la base.

`user` es `{ id, firstName, lastName, email, roles: [{ name, displayName }], permissions: string[] }`. Los roles son los activos y sin vencer; los permisos salen de `AccessService.getPermissionKeys`, la misma consulta que usa el guard.

### Validación del cuerpo
El DTO marca ambos campos como `@IsOptional() @IsString()` para que el `ValidationPipe` global no devuelva sus propios mensajes. `AuthService` recorta los valores y, si falta alguno, lanza 400 con "Ingrese su correo y contraseña"; si el correo no tiene formato válido (`isEmail` de class-validator), 400 con "Ingrese un correo electrónico válido". El correo se normaliza con `trim().toLowerCase()` y se busca con `mode: 'insensitive'`.

### Orden de las comprobaciones
1. Campos vacíos → 400.
2. Buscar el usuario por el correo de su persona. Si no existe o no tiene contraseña → se verifica contra un hash ficticio para igualar el tiempo de respuesta y se simulan intentos y bloqueo (ver abajo).
3. Bloqueo vigente (`isLocked` y `lockedAt + 15 min > ahora`) → 423 con los minutos restantes redondeados hacia arriba, sin verificar la contraseña ni tocar el contador.
4. Bloqueo vencido → se limpia (`isLocked = false`, `lockedAt = null`, contador en 0) antes de seguir.
5. Contraseña incorrecta → se incrementa el contador con `increment` atómico. Si llega a 5 se marca `isLocked`, `lockedAt = ahora` y el contador vuelve a 0, y se responde 423 con 15 minutos; si no, 401 con los intentos restantes ("Le quedan N intentos antes de que la cuenta se bloquee").
6. Estado distinto de `ACTIVE` → 403 con el mensaje de cuenta desactivada. Va después de la contraseña para no revelar el estado a quien no la conoce.
7. Éxito → contador en 0, se abre la sesión renovable y se emite el token.

### Correos no registrados
Mostrar los intentos restantes solo a cuentas existentes revelaría qué correos están registrados. Para evitarlo, los fallos con correos desconocidos se cuentan en Redis con la clave `auth:login-unknown:<sha256 del correo>` (24 h) y al quinto se crea `…:lock` con 15 minutos de vida; las respuestas son idénticas a las de una cuenta real. Si Redis no responde, se devuelve "Correo o contraseña incorrectos" sin contador y se registra una advertencia.

La duración del bloqueo (15 minutos) y el máximo de intentos (5) son constantes del servicio, no variables de entorno, porque los fija la HU.

| Caso | HTTP | `code` |
| --- | --- | --- |
| Campos vacíos | 400 | `LOGIN_MISSING_CREDENTIALS` |
| Credenciales incorrectas | 401 | `LOGIN_INVALID_CREDENTIALS` |
| Cuenta desactivada | 403 | `LOGIN_ACCOUNT_DISABLED` |
| Cuenta bloqueada | 423 | `LOGIN_ACCOUNT_LOCKED` |
| Correo con formato inválido | 400 | `LOGIN_INVALID_EMAIL` |
| Sesión renovable inválida | 401 | `SESSION_EXPIRED` |

Alternativa descartada: guardar el contador en Redis con TTL. Evita la migración, pero reparte el estado del bloqueo entre Redis y la base y hace que las pruebas dependan de Redis.

### Modelo
Se agrega `failedLoginAttempts Int @default(0) @map("failed_login_attempts")` a `User` con una migración nueva. Es un campo técnico, como `isLocked` y `lockedAt`.

### Sesiones renovables
El token de acceso sigue durando `JWT_EXPIRES_IN` (15 minutos) para que un permiso quitado o una cuenta desactivada dejen de valer pronto; la sesión de trabajo la sostiene un refresh token:
- `SessionService` genera 32 bytes aleatorios, guarda su SHA-256 en `user_sessions` (`refreshTokenHash`, `expiresAt`, IP y user agent) y lo entrega en la cookie `vetmanage_refresh`: `httpOnly`, `SameSite=Lax`, `Secure` en producción y `Path` limitado a las rutas `/auth`.
- Cada renovación revoca la sesión con `updateMany` condicionado a `revokedAt = null` y crea otra (rotación). Un token ya usado, vencido o de una cuenta no activa responde 401 y borra la cookie.
- La vigencia la fija `SESSION_EXPIRES_IN` (`12h` por defecto, una jornada de trabajo).

Alternativas descartadas: subir `JWT_EXPIRES_IN` a varias horas, porque los cambios de cuenta tardarían en aplicar al no poder revocar el token; y guardar el refresh token en `localStorage`, porque quedaría expuesto a XSS. La cookie no necesita dependencias nuevas: se lee del encabezado `Cookie` y se escribe con `response.cookie` de Express.

### Frontend
- Módulo `src/modules/auth` con `LoginPage`, `AuthProvider` (contexto con el perfil, `login`, `logout` y `hasPermission`), `RequireAuth` y el servicio `auth-api`.
- El token de acceso vive solo en memoria. Al cargar la app se llama a `POST /auth/refresh`; si la cookie es válida se recupera la sesión, y mientras responde se muestra un estado de carga.
- `http-client` envía `credentials: 'include'` y `Authorization: Bearer` cuando hay token. Si una petición con token devuelve 401, renueva la sesión una vez y repite la petición; si la renovación falla, avisa al `AuthProvider`, que redirige al login.
- Las renovaciones simultáneas comparten una sola petición, y entre pestañas se serializan con `navigator.locks` para que no usen a la vez el mismo refresh token.
- `AppShell` filtra los enlaces por permiso de lectura: Pacientes `pets:read` y Clientes `clients:read`. Resumen, Agenda e Inventario no tienen permiso asociado en el menú y se muestran a todos: ningún rol tiene todavía permisos de inventario y su grupo decide cuándo filtrarlo. El pie del menú es una tarjeta con el avatar, el nombre y el rol principal del usuario; al abrirla muestra su correo, todos sus roles y "Cerrar sesión". Ahí se agregarán las opciones de cuenta, como el cambio de contraseña (HU-59).
- La pantalla tiene un panel de marca con el logo y un formulario con iconos, mostrar u ocultar la contraseña, validación de campos vacíos y del formato del correo sin llamar a la API, y avisos diferenciados: error, advertencia con los intentos restantes y cuenta bloqueada.

### Configuración
No cambian puertos ni comandos de arranque. Se agrega `SESSION_EXPIRES_IN` (opcional, `12h`) en `.env.example`, `docker-compose.yml` y `env.validation.ts`. CORS ya permite credenciales con el origen de `CORS_ORIGIN`. El contenedor de la API ya ejecuta `prisma migrate deploy` al arrancar, así que aplica la migración nueva. El frontend sigue usando `VITE_API_URL`.

## Risks / Trade-offs

- [Frontend y API en dominios distintos en producción] → con `SameSite=Lax` la cookie no se envía entre sitios distintos; si se despliegan en dominios distintos habrá que usar `SameSite=None` con `Secure` o servirlos bajo el mismo dominio.
- [Robo del refresh token] → es `httpOnly`, se guarda solo como hash y rota en cada uso; la sesión dura como máximo `SESSION_EXPIRES_IN`.
- [Sesiones vencidas acumuladas en `user_sessions`] → no afectan el funcionamiento; la limpieza periódica queda para otra tarea.
- [Cambios de rol o cuentas desactivadas con sesión abierta (R-12)] → el guard consulta usuario y permisos en cada petición; el menú se actualiza al recargar con `GET /auth/me`.
- [Bloqueo intencional de cuentas ajenas conociendo el correo] → es el comportamiento que pide la HU; el bloqueo es temporal y no revela si la contraseña era correcta.
- [La migración toca `identity.prisma`, compartido con el grupo] → es una columna con valor por defecto, no rompe datos existentes; se avisa al grupo antes de integrar.
