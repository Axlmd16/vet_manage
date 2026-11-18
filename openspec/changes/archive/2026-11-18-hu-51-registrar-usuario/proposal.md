## Why

El único usuario del personal que existe es el Administrador inicial (y los del seed); no hay forma de dar de alta al resto del personal desde el sistema. HU-51 permite que el Administrador registre usuarios con uno o más roles y les envíe por correo una contraseña temporal, lo que también exige que la API pueda enviar correos (HT-03), que hoy no existe.

## What Changes

- Endpoint `POST /users` protegido con `users:create` que registra a un usuario del personal con cédula, nombres, apellidos, correo, teléfono opcional y uno o más roles del personal. La cuenta queda en estado Activo, con una contraseña temporal generada por el sistema y la marca de cambio obligatorio de contraseña.
- Si la cédula ya pertenece a una persona sin roles del personal (por ejemplo, una clienta), se reutiliza la persona y se agregan los roles a su cuenta, sin duplicarla.
- Validaciones y mensajes de la HU: "Complete los campos obligatorios", "Número de cédula ya registrado", "La cédula debe tener 10 dígitos válidos" (algoritmo de la cédula ecuatoriana), "El correo ya se encuentra registrado" y "Usuario registrado correctamente".
- Envío de las credenciales al correo registrado. Si el envío falla, la cuenta queda creada y se responde "Usuario registrado, pero no se pudo enviar el correo. Verifique la dirección y reenvíe las credenciales".
- Endpoint `GET /users/assignable-roles` con los roles del personal que se pueden asignar en el formulario.
- Servicio de correo SMTP reutilizable (cubre HT-03) con variables `SMTP_*`, `MAIL_FROM` y `APP_URL`, y una plantilla HTML de bienvenida con la contraseña temporal, los roles y el enlace al inicio de sesión, y el servicio Mailpit en `docker-compose.yml` para recibir los correos en desarrollo.
- El guard de permisos responde 403 con "No tiene permisos para realizar esta acción".
- Validador compartido de cédula ecuatoriana; `ADMIN_IDENTIFICATION` y las cédulas del seed pasan a ser válidas según el algoritmo.
- Frontend: pantalla de usuarios en `/users` con el botón "Nuevo usuario" (el resto queda reservado para el listado de HU-52), formulario de registro de personal en `/users/new` con selección de roles y validación en el cliente, avisos con los toasts de la aplicación (ahora abajo a la derecha, con un tipo de advertencia nuevo), regreso a `/users` tras registrar y enlace en el menú lateral según permiso.

Fuera de alcance: el listado de usuarios y editar o dar de baja usuarios (HU-52, HU-53, HU-61), el reenvío de credenciales y la pantalla de cambio de contraseña (HU-58, HU-59) y la auditoría (HU-60).

## Capabilities

### New Capabilities
- `user-registration`: registro de usuarios del personal en la API, reutilización de la persona existente, validaciones, contraseña temporal y envío de credenciales.
- `user-registration-ui`: pantalla de registro de personal, selección de roles, mensajes y acceso según permiso.
- `mail-delivery`: envío de correos por SMTP configurable por variables de entorno.

### Modified Capabilities
- `access-control`: la respuesta 403 del guard de permisos lleva el mensaje "No tiene permisos para realizar esta acción".

## Impact

- API: `src/modules/identity` (nuevo `UsersController`, DTO y servicio de registro), nuevo `src/infrastructure/mail`, validador en `src/common/validation`, mensaje de `PermissionsGuard`. Sin cambios en `schema.prisma` ni migraciones.
- Dependencias: `nodemailer` (y `@types/nodemailer`) en la API.
- Configuración: `APP_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` en `.env.example`, `docker-compose.yml` y `env.validation.ts`; nuevo servicio `mailpit`.
- Seed: cédulas de los usuarios de ejemplo cambian a números válidos (se avisa al grupo).
- Frontend: nuevo módulo `users`, rutas `/users` y `/users/new`, enlace en `AppShell`, y los toasts pasan a mostrarse abajo a la derecha en toda la aplicación.
