## Context

HT-01 dejó listos `PasswordHasher`, `TokenService` (JWT con `sub`, 15 minutos por defecto), `JwtAuthGuard`, `PermissionsGuard`, `@Authenticated()` y `@RequirePermissions()`. `User` ya tiene `status`, `isLocked`, `lockedAt` y `mustChangePassword`, y el correo está en `Person`, único y obligatorio. No existe ningún controlador en `identity` ni pantalla de inicio de sesión; el frontend muestra un usuario de demostración fijo.

## Goals / Non-Goals

**Goals:**
- Endpoint de inicio de sesión con los mensajes y el bloqueo de la HU.
- Perfil de la sesión con roles y permisos para armar el menú.
- Pantalla de inicio de sesión, rutas protegidas, cierre de sesión y menú por permisos.

**Non-Goals:**
- Pantalla de cambio obligatorio de contraseña (HU-59); solo se devuelve el indicador.
- Refresh tokens y la tabla `user_sessions`.
- Auditoría de inicios de sesión (HU-60).
- Ocultar botones de acción dentro de cada pantalla; cada módulo lo hace con los permisos del perfil.

## Decisions

### Endpoints
`AuthController` en `src/modules/identity` con:
- `POST /auth/login` (público): cuerpo `{ email, password }`. Responde `{ accessToken, mustChangePassword, user }`.
- `GET /auth/me` (`@Authenticated()`): responde `user` y `mustChangePassword` leídos de la base.

`user` es `{ id, firstName, lastName, email, roles: [{ name, displayName }], permissions: string[] }`. Los roles son los activos y sin vencer; los permisos salen de `AccessService.getPermissionKeys`, la misma consulta que usa el guard.

### Validación del cuerpo
El DTO marca ambos campos como `@IsOptional() @IsString()` para que el `ValidationPipe` global no devuelva sus propios mensajes. `AuthService` recorta los valores y, si falta alguno, lanza 400 con "Ingrese su correo y contraseña". El correo se normaliza con `trim().toLowerCase()` y se busca con `mode: 'insensitive'`.

### Orden de las comprobaciones
1. Campos vacíos → 400.
2. Buscar el usuario por el correo de su persona. Si no existe o no tiene contraseña → se verifica contra un hash ficticio para igualar el tiempo de respuesta y se responde 401.
3. Bloqueo vigente (`isLocked` y `lockedAt + 15 min > ahora`) → 423 con los minutos restantes redondeados hacia arriba, sin verificar la contraseña ni tocar el contador.
4. Bloqueo vencido → se limpia (`isLocked = false`, `lockedAt = null`, contador en 0) antes de seguir.
5. Contraseña incorrecta → se incrementa el contador con `increment` atómico. Si llega a 5 se marca `isLocked`, `lockedAt = ahora` y el contador vuelve a 0, y se responde 423 con 15 minutos; si no, 401.
6. Estado distinto de `ACTIVE` → 403 con el mensaje de cuenta desactivada. Va después de la contraseña para no revelar el estado a quien no la conoce.
7. Éxito → contador en 0 y se emite el token.

La duración del bloqueo (15 minutos) y el máximo de intentos (5) son constantes del servicio, no variables de entorno, porque los fija la HU.

| Caso | HTTP | `code` |
| --- | --- | --- |
| Campos vacíos | 400 | `LOGIN_MISSING_CREDENTIALS` |
| Credenciales incorrectas | 401 | `LOGIN_INVALID_CREDENTIALS` |
| Cuenta desactivada | 403 | `LOGIN_ACCOUNT_DISABLED` |
| Cuenta bloqueada | 423 | `LOGIN_ACCOUNT_LOCKED` |

Alternativa descartada: guardar el contador en Redis con TTL. Evita la migración, pero reparte el estado del bloqueo entre Redis y la base y hace que las pruebas dependan de Redis.

### Modelo
Se agrega `failedLoginAttempts Int @default(0) @map("failed_login_attempts")` a `User` con una migración nueva. Es un campo técnico, como `isLocked` y `lockedAt`.

### Frontend
- Módulo `src/modules/auth` con `LoginPage`, `AuthProvider` (contexto con el perfil, `login`, `logout` y `hasPermission`), `RequireAuth` y el servicio `auth-api`.
- El token se guarda en `localStorage`. Al cargar la app, si hay token, se llama a `GET /auth/me`; mientras responde se muestra un estado de carga.
- `http-client` añade `Authorization: Bearer` cuando hay token y, si una petición con token devuelve 401, limpia la sesión y avisa al `AuthProvider`, que redirige al login.
- `AppShell` filtra los enlaces por permiso de lectura: Pacientes `pets:read` y Clientes `clients:read`. Resumen, Agenda e Inventario no tienen permiso asociado en el menú y se muestran a todos: ningún rol tiene todavía permisos de inventario y su grupo decide cuándo filtrarlo. El pie del menú muestra nombre, roles y "Cerrar sesión".
- La pantalla valida campos vacíos sin llamar a la API y muestra el `message` de la respuesta en los demás casos.

### Configuración
No cambian puertos, variables de entorno ni comandos de arranque. El contenedor de la API ya ejecuta `prisma migrate deploy` al arrancar, así que aplica la migración nueva. El frontend sigue usando `VITE_API_URL`.

## Risks / Trade-offs

- [El token vive 15 minutos y no hay refresh token] → el usuario vuelve a iniciar sesión al vencer; los refresh tokens quedan para otra historia.
- [Token en `localStorage` expuesto a XSS] → React escapa el contenido y no se usa HTML sin sanitizar; se reevalúa con cookies `httpOnly` cuando se implementen los refresh tokens.
- [Cambios de rol o cuentas desactivadas con sesión abierta (R-12)] → el guard consulta usuario y permisos en cada petición; el menú se actualiza al recargar con `GET /auth/me`.
- [Bloqueo intencional de cuentas ajenas conociendo el correo] → es el comportamiento que pide la HU; el bloqueo es temporal y no revela si la contraseña era correcta.
- [La migración toca `identity.prisma`, compartido con el grupo] → es una columna con valor por defecto, no rompe datos existentes; se avisa al grupo antes de integrar.
