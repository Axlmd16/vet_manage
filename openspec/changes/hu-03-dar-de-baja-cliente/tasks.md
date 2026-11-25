## 1. Base de datos

- [ ] 1.1 Avisar al grupo del cambio de esquema y agregar a `Client` (`prisma/schema/identity.prisma`) `deactivatedAt`, `deactivatedById` (relación a `User`, `onDelete: Restrict`) y `deactivationReason` (`VarChar(500)`).
- [ ] 1.2 Crear la migración `add_client_deactivation` con `npx prisma migrate dev` y verificarla con `npx prisma migrate reset --force` sobre una base vacía.

## 2. Auditoría

- [ ] 2.1 Agregar `deactivate: 'Dar de baja'` a `AUDIT_ACTIONS` en `src/modules/audit/audit.catalog.ts` y actualizar la prueba del catálogo.

## 3. Dominio de agenda (coordinado con el Módulo 2)

- [ ] 3.1 Crear `src/modules/scheduling/appointments/services/pending-appointments.service.ts` con `countFutureByClient(clientId, now)` (citas `PROGRAMADA` o `CONFIRMADA` con `fechaHora > now` de los pacientes del cliente) y exportarlo desde su módulo.
- [ ] 3.2 Probar `pending-appointments.service.spec.ts`: cuenta citas futuras programadas y confirmadas; ignora pasadas, canceladas, finalizadas y de otros clientes.

## 4. Backend – Baja de clientes

- [ ] 4.1 Crear `src/modules/clients/dtos/deactivate-client.dto.ts` (`reason` opcional en el DTO; la validación de negocio la hace el servicio para responder con los mensajes de la HU).
- [ ] 4.2 Agregar `deactivate(clientId, reason, actorId)` a `ChangeClientStatusService`: motivo obligatorio y ≤ 500 (`400`), cliente inexistente (`404`), ya de baja (`409`), citas pendientes (`409` con el conteo), actualización de estado y datos de la baja, y auditoría "Dar de baja" en la misma transacción.
- [ ] 4.3 Exponer `PATCH /clients/:clientId/deactivate` en `clients.controller.ts` con `ParseUUIDPipe` y `@RequirePermissions('clients:deactivate')`; importar el módulo de agenda en `clients.module.ts`.
- [ ] 4.4 Devolver `deactivatedAt`, `deactivationReason` y el nombre del responsable en el listado/detalle de clientes (`clients.repository.ts`, `client-response.dto.ts`).
- [ ] 4.5 Pruebas: `change-client-status.service.spec.ts` (baja desde Activo e Inactivo, motivo vacío/en blanco/500/501, 404, ya de baja, citas pendientes, auditoría con valores anterior y nuevo, sin auditoría al rechazar, fallo de auditoría revierte) y `clients.controller.spec.ts` (endpoint y permiso).
- [ ] 4.6 Prueba e2e en `test/clients/` (una carpeta por dominio): baja con Gerente, `403` con Recepcionista, registro de paciente rechazado para cliente de baja y registro en `audit_logs`.

## 5. Frontend – Acción «Dar de baja»

- [ ] 5.1 Agregar `deactivate(clientId, reason)` y los campos de la baja en `src/modules/clients/services/clients-api.ts` y `types.ts`, con su prueba.
- [ ] 5.2 En `clients-page.tsx` / `clients-page.css`: botón «Dar de baja» solo con `clients:deactivate` y estado `ACTIVE`/`INACTIVE`; modal con motivo obligatorio (máx. 500), transición `→ De baja`, «Cancelar» sin cambios y «Confirmar baja»; mensaje de citas pendientes con el conteo.
- [ ] 5.3 Vista de un cliente `De baja` en solo lectura con fecha, responsable, motivo y mascotas; sin acciones de edición ni cambio de estado.
- [ ] 5.4 Pruebas en `clients-page.test.tsx`: visibilidad por permiso y estado, motivo obligatorio, confirmación, cancelación, error de citas pendientes y vista de solo lectura.

## 6. Verificación final

- [ ] 6.1 Ejecutar `docker compose exec -T api sh -c 'npm test && npm run lint && npx tsc -p tsconfig.build.json --noEmit'` y `docker compose exec -T frontend sh -c 'npm test && npm run lint && npm run build'`.
- [ ] 6.2 Verificar en `audit_logs` el registro "Dar de baja" con valor anterior y nuevo tras una baja real.
