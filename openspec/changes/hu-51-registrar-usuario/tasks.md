## 1. Correo SMTP

- [x] 1.1 Agregar `nodemailer` y `@types/nodemailer` a la API
- [x] 1.2 Agregar `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD` y `MAIL_FROM` a `configuration.ts` y `env.validation.ts` con sus valores por defecto
- [x] 1.3 Crear `MailModule` y `MailService.send` en `src/infrastructure/mail` con tiempos de espera y autenticación opcional
- [x] 1.4 Pruebas unitarias de `MailService`: envío con el remitente configurado y error ante fallo del transporte
- [x] 1.5 Agregar el servicio `mailpit` a `docker-compose.yml` (SMTP 51025, web 58025) y las variables a `.env.example`

## 2. Cédula y mensaje de permisos

- [x] 2.1 Crear `isValidIdentification` en `src/common/validation/identification.ts` con pruebas de cédulas válidas, cortas, de provincia o tercer dígito inválidos y con verificador incorrecto
- [x] 2.2 Validar `ADMIN_IDENTIFICATION` con `isValidIdentification`
- [x] 2.3 Cambiar el mensaje 403 de `PermissionsGuard` a "No tiene permisos para realizar esta acción" y ajustar sus pruebas
- [x] 2.4 Cambiar las cédulas del seed a números válidos, hacer el `upsert` de la persona por correo; ajustar `identity.seed.spec.ts`

## 3. Registro de usuarios en la API

- [x] 3.1 Crear `generateTemporaryPassword` con pruebas de longitud, política y valores distintos
- [x] 3.2 Crear `RegisterUserDto` con los campos opcionales tipados
- [x] 3.3 Crear `UserRegistrationService.register` con la validación en orden, los roles del personal y los códigos de error
- [x] 3.4 Implementar la transacción: persona nueva, persona existente sin roles del personal, cédula del personal duplicada, correo duplicado y traducción de `P2002`
- [x] 3.5 Enviar las credenciales después de la transacción y responder `credentialsSent` y el mensaje según el resultado
- [x] 3.6 Crear `listAssignableRoles` y `UsersController` con `POST /users` y `GET /users/assignable-roles` protegidos con `users:create`; registrar todo en `IdentityModule`
- [x] 3.7 Pruebas unitarias de `UserRegistrationService` para los escenarios 1 a 8 de la HU
- [x] 3.8 Pruebas e2e de `POST /users` y `GET /users/assignable-roles` contra la base con el correo simulado, incluido el 403 del Recepcionista y el 401 sin sesión
- [x] 3.9 Documentar el registro, la cédula y el correo en `vet-manage-api/docs/identity-rbac.md`

## 4. Frontend

- [x] 4.1 Crear `isValidIdentification` en `src/common/validation/identification.ts`
- [x] 4.2 Crear `types.ts` y `users-api.ts` con `register` y `assignableRoles`
- [x] 4.3 Crear `RequirePermission` que muestra "No tiene permisos para realizar esta acción" sin el permiso
- [x] 4.4 Crear `UsersPage` con el título, el botón "Nuevo usuario" según permiso y el espacio reservado para el listado
- [x] 4.5 Crear `UserRegisterPage` con el formulario, la carga de roles, la validación en el cliente y el resaltado de campos
- [x] 4.6 Avisar con toasts (éxito, advertencia por correo no enviado, errores de la API con resaltado de duplicados), volver a `/users` tras registrar y agregar el tipo `warning` y la posición abajo a la derecha
- [x] 4.7 Agregar las rutas `/users` y `/users/new` y la sección "Administración" con el enlace "Usuarios" filtrado por `users:read`

## 5. Verificación

- [x] 5.1 Ejecutar lint, pruebas unitarias y e2e de la API y lint y build del frontend
- [x] 5.2 Probar en Docker los escenarios 1 a 9 de la HU con el Administrador inicial, revisando los correos en Mailpit y el fallo de envío con Mailpit detenido

## 6. Plantilla del correo

- [x] 6.1 Crear `email-layout.ts` y `credentials-email.ts` en `src/infrastructure/mail/templates` con versión HTML y texto, valores escapados y pruebas
- [x] 6.2 Usar la plantilla en el registro, con los roles y el enlace al inicio de sesión tomado de la variable `APP_URL`
