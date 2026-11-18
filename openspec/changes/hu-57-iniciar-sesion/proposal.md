## Why

La API ya emite y valida tokens y protege rutas por permiso, pero no hay forma de obtener un token: falta el inicio de sesión con correo y contraseña, el bloqueo por intentos fallidos y la pantalla en el frontend. Sin esto ninguna otra historia puede usarse con un usuario real.

## What Changes

- Endpoint público `POST /auth/login` con correo y contraseña que devuelve el token de acceso, los datos del usuario, sus roles, sus permisos y el indicador de cambio obligatorio de contraseña.
- Endpoint `GET /auth/me` para que el frontend recupere el usuario de la sesión y sus permisos vigentes.
- Mensajes de la HU: "Ingrese su correo y contraseña", "Correo o contraseña incorrectos", "Cuenta bloqueada temporalmente. Intente en N minutos" y "Su cuenta se encuentra desactivada. Contacte al administrador".
- Bloqueo de la cuenta durante 15 minutos al quinto intento fallido consecutivo y reinicio del contador al iniciar sesión correctamente.
- Nuevo campo técnico `failedLoginAttempts` en `User`, con migración.
- Frontend: pantalla de inicio de sesión, rutas protegidas, cierre de sesión y menú lateral filtrado por los permisos de los roles del usuario.

Fuera de alcance: la pantalla de cambio obligatorio de contraseña (HU-59), la recuperación de contraseña (HU-58), los refresh tokens y la auditoría de accesos (HU-60).

## Capabilities

### New Capabilities
- `user-login`: inicio de sesión con correo y contraseña, mensajes al usuario y bloqueo por intentos fallidos.
- `login-ui`: pantalla de inicio de sesión, protección de rutas, cierre de sesión y menú según permisos.

### Modified Capabilities

## Impact

- Base de datos: columna `failed_login_attempts` en `users` (migración nueva en `identity.prisma`; se avisa al grupo).
- API: `src/modules/identity` (controlador, DTO y servicio de autenticación). Sin dependencias nuevas.
- Frontend: nuevo módulo `auth`, `http-client` envía el token, `router` y `app-shell` usan la sesión.
- Otros módulos: sus rutas siguen igual; el frontend ahora exige sesión para mostrarlas.
