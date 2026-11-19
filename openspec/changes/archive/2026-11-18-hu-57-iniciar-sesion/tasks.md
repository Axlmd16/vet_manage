## 1. Modelo

- [x] 1.1 Agregar `failedLoginAttempts` a `User` en `identity.prisma` y generar la migración
- [x] 1.2 Regenerar el cliente de Prisma y verificar que compila

## 2. Inicio de sesión en la API

- [x] 2.1 Crear el DTO de inicio de sesión con ambos campos opcionales de tipo texto
- [x] 2.2 Agregar a `AccessService` la consulta de roles activos y vigentes y armar el perfil de sesión
- [x] 2.3 Crear `AuthService.login` con el orden de comprobaciones, el bloqueo, el contador y los mensajes de la HU
- [x] 2.4 Crear `AuthController` con `POST /auth/login` y `GET /auth/me` y registrarlo en `IdentityModule`
- [x] 2.5 Pruebas unitarias de `AuthService`: vacíos, credenciales incorrectas, quinto intento, bloqueo vigente con minutos restantes, bloqueo vencido, reinicio del contador y cuenta desactivada
- [x] 2.6 Pruebas e2e de `POST /auth/login` y `GET /auth/me` contra la base

## 3. Frontend

- [x] 3.1 Guardar y leer el token en `localStorage` y enviarlo desde `http-client`; avisar cuando una petición con token devuelve 401
- [x] 3.2 Crear `auth-api`, `AuthProvider` con `login`, `logout`, `hasPermission` y la recarga del perfil con `GET /auth/me`
- [x] 3.3 Crear `LoginPage` con validación de campos vacíos y los mensajes de la API
- [x] 3.4 Proteger las rutas con `RequireAuth` y agregar la ruta `/login`
- [x] 3.5 Filtrar el menú de `AppShell` por permisos y mostrar nombre, roles y "Cerrar sesión"

## 4. Mejoras: sesiones renovables, intentos y pantalla

- [x] 4.1 Validar el formato del correo en la API y en la pantalla
- [x] 4.2 Indicar los intentos restantes y simular intentos y bloqueo en Redis para correos no registrados
- [x] 4.3 Crear `SessionService` con refresh token rotativo en `user_sessions` y la variable `SESSION_EXPIRES_IN`
- [x] 4.4 Agregar `POST /auth/refresh` y `POST /auth/logout` con la cookie `httpOnly`
- [x] 4.5 Guardar el token de acceso en memoria, renovar la sesión ante un 401 y al recargar
- [x] 4.6 Rediseñar la pantalla de inicio de sesión
- [x] 4.7 Pruebas unitarias y e2e de intentos restantes, correo inválido, renovación, reutilización, cierre de sesión y bloqueo simulado de correos no registrados
- [x] 4.8 Rediseñar el menú lateral con iconos, secciones y tarjeta de usuario con panel de opciones

## 5. Verificación

- [x] 5.1 Ejecutar lint, pruebas unitarias y e2e de la API y build del frontend
- [x] 5.2 Probar en Docker los escenarios de la HU con el Administrador inicial
