## Context

HT-01, HT-02 y HU-57 dejaron listos `Person` (cédula y correo únicos), `User` (contraseña, estado, `mustChangePassword`), `UserRole` con `assignedById`, el catálogo de roles (`administrator`, `manager`, `veterinarian`, `veterinary_technician`, `receptionist`, `cashier`, `warehouse_keeper` de categoría STAFF y `client` de categoría CLIENT), el permiso `users:create` asignado al Administrador, `PasswordHasher`, `@RequirePermissions()` y la sesión en el frontend con `hasPermission`. No existe envío de correo (HT-03 no se ha hecho) ni validación de cédula más allá de "10 dígitos" en `ADMIN_IDENTIFICATION`.

## Goals / Non-Goals

**Goals:**
- Registrar usuarios del personal con uno o varios roles, contraseña temporal y envío de credenciales.
- Reutilizar a la persona existente (por ejemplo una clienta) sin duplicarla.
- Servicio de correo SMTP reutilizable por otras historias (HU-58, avisos).
- Pantalla de registro con los mensajes de la HU.

**Non-Goals:**
- Listado, edición, baja o reenvío de credenciales (HU-52, HU-53, HU-58, HU-61).
- Pantalla de cambio obligatorio de contraseña (HU-59).
- Auditoría del registro (HU-60).
- Cola de correos con RabbitMQ y reintentos automáticos.

## Decisions

### Ubicación
El registro vive en `src/modules/identity`, junto al resto de cuentas y roles: `users.controller.ts`, `dtos/register-user.dto.ts`, `services/user-registration.service.ts` y `services/temporary-password.ts`. El correo es infraestructura compartida: `src/infrastructure/mail/mail.module.ts` y `mail.service.ts`, importado por `IdentityModule`. El validador de cédula va en `src/common/validation/identification.ts` para que lo usen también clientes (HU-01) y la validación del entorno.

### Endpoints
- `POST /users` con `@RequirePermissions('users:create')`. Cuerpo `{ identification, firstName, lastName, email, phone?, roles: string[] }` (nombres de rol). Responde 201 con `{ id, personId, identification, firstName, lastName, email, phone, status, roles: [{ name, displayName }], existingPerson, passwordAssigned, credentialsSent }`.
- `GET /users/assignable-roles` con `@RequirePermissions('users:create')`: roles activos de categoría STAFF con `name`, `displayName` y `description`, ordenados por `displayName`. Se protege con el mismo permiso porque solo lo usa el formulario de registro; HU-54 podrá reutilizarlo.

### Validación
Como en el inicio de sesión, el DTO declara los campos `@IsOptional()` con su tipo (`@IsString()`, `@IsArray()`) para que el `ValidationPipe` global no devuelva sus propios mensajes, y `UserRegistrationService` valida en este orden:
1. Obligatorios vacíos (tras `trim`) o `roles` vacío → 400 `USER_MISSING_FIELDS`, "Complete los campos obligatorios", con los nombres de los campos en `errors` para que la pantalla los resalte.
2. Cédula (`isValidIdentification`) → 400 `USER_INVALID_IDENTIFICATION`.
3. Correo (`isEmail` de class-validator) → 400 `USER_INVALID_EMAIL`; teléfono (`^\+?\d{7,15}$`) → 400 `USER_INVALID_PHONE`; nombres de más de 100 caracteres → 400 `USER_INVALID_NAME`.
4. Roles: se quitan repetidos y se buscan por nombre con `isActive` y `category = STAFF`; si falta alguno → 400 `USER_INVALID_ROLES`.

El correo se guarda con `trim().toLowerCase()` y se compara con `mode: 'insensitive'`. Se usa `new ApiException(mensaje, status, errors, code)` para devolver el `code`.

### Cédula ecuatoriana
`isValidIdentification(value)`: 10 dígitos; provincia (dos primeros) entre 01 y 24 o 30; tercer dígito menor que 6; dígito verificador módulo 10 con coeficientes 2,1,2,1,2,1,2,1,2 (los productos mayores que 9 restan 9) y verificador `(10 - suma % 10) % 10`. Se usa también en `env.validation.ts` para `ADMIN_IDENTIFICATION` (el valor por defecto `1700000001` es válido). El frontend tiene su propia copia de la función en `src/common/validation/identification.ts`, porque no comparten paquete.

Las cédulas del seed (`1700000101`…) no pasan el verificador; se reemplazan por números válidos para poder probar los escenarios con datos del seed. Para que una base ya sembrada no choque con el correo único, el seed pasa a hacer `upsert` de la persona por correo (que no cambia) y actualiza la cédula. El cliente de ejemplo del seed (`cliente@vetmanage.local`, solo rol Cliente) sirve para probar el escenario 3. Los ejemplos de la HU (`1104567890`, `1105555555`) tampoco son válidos, así que las pruebas usan cédulas válidas equivalentes.

### Persona existente y duplicados
Dentro de `prisma.$transaction`:
1. Buscar la persona por cédula con su cuenta y los roles activos y vigentes de esa cuenta.
2. Si existe y algún rol es de categoría STAFF → 409 `USER_IDENTIFICATION_TAKEN`, "Número de cédula ya registrado".
3. Si existe sin roles del personal → se reutiliza. Sus datos guardados no se modifican (actualizarlos es HU-53) y las credenciales se envían a su correo guardado. Si no tiene cuenta se crea; si la cuenta no tiene contraseña se le asigna una temporal; si ya tiene, conserva contraseña y estado y no se envía correo. Se agregan los roles con `createMany` y `skipDuplicates`.
4. Si no existe → verificar que el correo no pertenezca a otra persona (409 `USER_EMAIL_TAKEN`) y crear persona, cuenta (`ACTIVE`, `mustChangePassword: true`) y roles.

Todas las asignaciones guardan `assignedById` con el id del Administrador de la sesión. Un `P2002` de Prisma por carrera entre dos registros simultáneos se traduce al 409 de cédula o correo según el campo del error.

Alternativa descartada: rechazar la cédula de cualquier persona existente. Contradice el escenario 3 y obligaría a duplicar a la persona.

### Contraseña temporal
`generateTemporaryPassword()` con `crypto.randomInt`: 12 caracteres de un alfabeto sin caracteres confusos (sin `0/O`, `1/l/I`), garantizando una mayúscula, una minúscula y un dígito y mezclando con Fisher–Yates. Se hashea con `PasswordHasher` dentro de la transacción y el texto plano solo se usa para el correo; nunca se registra en logs ni se devuelve.

### Envío de credenciales
El correo se envía después de confirmar la transacción, para no dejar la base esperando al servidor SMTP ni deshacer el registro si el envío falla. Si `MailService.send` lanza, se registra una advertencia con el id del usuario (sin la contraseña) y se responde 201 con `credentialsSent: false` y el mensaje de la HU. Si no se asignó contraseña (cuenta existente que ya tenía una), `passwordAssigned` y `credentialsSent` son `false` y el mensaje es "Usuario registrado correctamente". El frontend no recibe el `message` del envelope (el cliente HTTP lo desenvuelve), así que decide el aviso con `passwordAssigned` y `credentialsSent`.

El mensaje se arma en `src/infrastructure/mail/templates`: `email-layout.ts` es la estructura común (cabecera con el nombre, contenido y pie de mensaje automático, con tablas y estilos en línea y sin imágenes externas, para que se vea igual en cualquier cliente) y `credentials-email.ts` renderiza el correo de bienvenida con asunto "Su cuenta de VetManage está lista": saludo, tarjeta con correo de acceso, contraseña temporal y roles, botón "Iniciar sesión" y aviso de cambiar la contraseña en el primer ingreso. Devuelve texto plano y HTML con los valores escapados. El enlace sale de `APP_URL` (dirección pública del frontend, `http://localhost:5174` por defecto). El diseño queda listo para reutilizarlo en HU-58.

Alternativa descartada: publicar el envío en RabbitMQ. Desacopla y permite reintentos, pero la HU exige avisar en la misma respuesta si el correo no salió.

### Servicio de correo
`MailService` crea un transporte de `nodemailer` con la configuración `mail` (`host`, `port`, `secure`, `user`, `password`, `from`), `connectionTimeout` y `greetingTimeout` de 10 s y `auth` solo si hay usuario. Expone `send({ to, subject, text, html })`. En las pruebas se reemplaza el proveedor por un doble.

### Configuración y puertos
Variables nuevas (opcionales, con valores de desarrollo):

| Variable | Por defecto | Validación |
| --- | --- | --- |
| `APP_URL` | `http://localhost:5174` | URL http o https |
| `SMTP_HOST` | `mailpit` | texto |
| `SMTP_PORT` | `51025` | entero ≥ 1 |
| `SMTP_SECURE` | `false` | booleano |
| `SMTP_USER` / `SMTP_PASSWORD` | vacías | texto |
| `MAIL_FROM` | `VetManage <no-reply@vetmanage.local>` | `correo@dominio` o `Nombre <correo@dominio>` |

Servicio `mailpit` (`axllent/mailpit`) en `docker-compose.yml` escuchando en puertos no predeterminados dentro y fuera del contenedor, como el resto de servicios: SMTP `51025` (`MP_SMTP_BIND_ADDR`) e interfaz web `58025` (`MP_UI_BIND_ADDR`), publicados con `MAIL_SMTP_PORT` y `MAIL_UI_PORT`. La API lo alcanza como `mailpit:51025` y depende de él. Los correos se ven en `http://localhost:58025`. Se agregan las variables a `.env.example`. No cambian los comandos de arranque: `docker compose up` sigue levantando todo y la API instala la dependencia nueva con su imagen.

### Mensaje 403
`PermissionsGuard` lanza `ApiException.forbidden('No tiene permisos para realizar esta acción')`, que es el mensaje de la HU para cualquier acción sin permiso.

### Frontend
- Módulo `src/modules/users`: `services/users-api.ts` (`register`, `assignableRoles`), `types.ts`, `pages/users-page.tsx` (título, botón "Nuevo usuario" y un espacio reservado para el listado de HU-52) y `pages/user-register-page.tsx` con su CSS.
- Distribución: las dos pantallas ocupan el ancho disponible (hasta 1480 px). El formulario va en dos tarjetas: "Datos personales" (cédula, teléfono, nombres, apellidos y correo con iconos en cada campo, más una nota sobre la contraseña temporal) y "Roles" (tarjetas con icono por rol, marca de selección y contador); en pantallas angostas se apilan.
- Las reglas del formulario (validación previa, traducción de los errores de la API a campos resaltados y el aviso tras registrar) viven en `modules/users/form-rules.ts`, sin dependencias de React, para probarlas con vitest, que se agrega al frontend (`npm test`).
- Rutas: `/users` exige `users:read` y `/users/new` exige `users:create`, con el componente `RequirePermission` de `modules/auth/components`, que muestra "No tiene permisos para realizar esta acción" si falta el permiso. El botón "Nuevo usuario" solo se muestra con `users:create`.
- El formulario valida antes de enviar (obligatorios, cédula, correo, teléfono), resalta los campos de `errors` de la API y los duplicados según el `code` (`USER_IDENTIFICATION_TAKEN` → cédula, `USER_EMAIL_TAKEN` → correo) y comunica todo con los toasts existentes. Al registrar vuelve a `/users`; el `ToastProvider` está sobre el router, así que el aviso sobrevive a la navegación. Ante un rechazo de la API se queda en el formulario con los datos escritos.
- Toasts: se agrega el tipo `warning` (correo no enviado) y la región de toasts pasa de arriba a abajo a la derecha, con lo que también cambia de lugar en Inventario.
- `AppShell` agrega la sección "Administración" con el enlace "Usuarios" a `/users` y permiso `users:read`.

## Risks / Trade-offs

- [La persona reutilizada tiene otro correo que el escrito en el formulario] → se conservan los datos guardados y el correo sale a la dirección guardada; la respuesta marca `existingPerson` y la pantalla lo indica. Cambiar datos es HU-53.
- [Una cuenta existente inactiva o dada de baja recibe roles del personal] → conserva su estado; reactivarla es HU-55. Se documenta en el PR.
- [El SMTP real tarda o no responde] → tiempos de espera de 10 s y la cuenta queda creada; el Administrador ve la advertencia.
- [La contraseña temporal viaja por correo en texto plano] → es lo que pide la HU; `mustChangePassword` obliga a cambiarla (HU-59).
- [Cambiar el mensaje 403 afecta a todas las rutas] → es el mismo texto que piden las HU; ninguna prueba depende del anterior.
- [Cambiar las cédulas del seed] → solo afecta a bases de desarrollo; al buscar por correo, el seed actualiza las cédulas de una base existente sin duplicar personas. Se avisa al grupo.
- [El algoritmo rechaza cédulas de prueba que otros integrantes usen] → el validador es compartido y se documenta en `identity-rbac.md`.
