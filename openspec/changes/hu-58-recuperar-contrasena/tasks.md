## 1. Base de datos y configuración

- [ ] 1.1 Avisar al grupo del cambio de esquema y agregar el modelo `PasswordResetToken` (`password_reset_tokens`: `id`, `userId`, `tokenHash` único, `expiresAt`, `usedAt`, `replacedAt`, `createdAt`; índices por `userId` y `expiresAt`) en `prisma/schema/identity.prisma`.
- [ ] 1.2 Crear la migración `add_password_reset_tokens` y verificarla con `npx prisma migrate reset --force` en una base vacía.
- [ ] 1.3 Agregar `PASSWORD_RESET_TTL_MINUTES` (por defecto 30) a `env.validation.ts`, `configuration.ts`, `.env.example` y `docker-compose.yml`, con su prueba en `env.validation.spec.ts`.

## 2. Auditoría y correo

- [ ] 2.1 Agregar `requestPasswordReset: 'Solicitar recuperación'` y `resetPassword: 'Restablecer contraseña'` a `AUDIT_ACTIONS`.
- [ ] 2.2 Crear `src/infrastructure/mail/templates/password-reset-email.ts` (asunto, texto y HTML con el enlace y la vigencia de 30 minutos) y su prueba.

## 3. Backend – Recuperación de contraseña

- [ ] 3.1 Crear `repositories/password-reset-token.repository.ts` (crear, reemplazar los vigentes de un usuario, buscar por hash, marcar usado).
- [ ] 3.2 Agregar `revokeAllForUser(userId, tx)` a `SessionService` y su prueba.
- [ ] 3.3 Crear `services/recover-password.service.ts` con `request(email)`, `validate(token)` y `confirm(input)` según las specs: respuesta uniforme, solo cuentas `ACTIVE`, reemplazo de enlaces, límite en Redis (3 cada 15 minutos), estados expirado/no válido, validaciones en el orden definido, restablecimiento atómico (contraseña, `mustChangePassword`, intentos, bloqueo, token usado, sesiones) y auditoría sin secretos.
- [ ] 3.4 Crear los DTO `password-reset-request.dto.ts` y `password-reset-confirm.dto.ts` y exponer `POST /auth/password-reset/request`, `GET /auth/password-reset/validate` y `POST /auth/password-reset/confirm` en `auth.controller.ts`.
- [ ] 3.5 Pruebas unitarias `recover-password.service.spec.ts`: los 7 escenarios de la HU, correo con mayúsculas, cuenta inactiva, límite de solicitudes, fallo de SMTP con la misma respuesta, token guardado solo como hash, sesiones cerradas, bloqueo limpiado y auditoría (dos acciones, sin secretos, sin registro al rechazar).
- [ ] 3.6 Prueba e2e en `test/identity/password-reset.e2e-spec.ts`: solicitar, leer el enlace, restablecer, iniciar sesión con la nueva contraseña y reusar el enlace (`400`).

## 4. Frontend – Pantallas de recuperación

- [ ] 4.1 Agregar `requestPasswordReset`, `validatePasswordReset` y `confirmPasswordReset` en `src/modules/auth/services/auth-api.ts` con su prueba.
- [ ] 4.2 Crear `forgot-password-page.tsx` (ruta pública `/forgot-password`) con validación del correo y el mensaje uniforme.
- [ ] 4.3 Crear `reset-password-page.tsx` (ruta pública `/reset-password`) que valida el enlace al abrirlo, muestra los mensajes de vencido/no válido con opción de pedir otro, y el formulario con validación en cliente.
- [ ] 4.4 En `login-page.tsx`, reemplazar el texto de ayuda por el enlace «¿Olvidó su contraseña?» y mostrar el aviso de contraseña actualizada; registrar las rutas públicas en `router.tsx`.
- [ ] 4.5 Pruebas de las tres páginas (validaciones, mensajes de la API, estados del enlace y redirección al login).

## 5. Verificación final

- [ ] 5.1 Ejecutar `docker compose exec -T api sh -c 'npm test && npm run lint && npx tsc -p tsconfig.build.json --noEmit'` y `docker compose exec -T frontend sh -c 'npm test && npm run lint && npm run build'`.
- [ ] 5.2 Recorrer el flujo completo con Mailpit (`http://localhost:58025`) y comprobar en `audit_logs` los registros "Solicitar recuperación" y "Restablecer contraseña" sin token ni contraseña.
