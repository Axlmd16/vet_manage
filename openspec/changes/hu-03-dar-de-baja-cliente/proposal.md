## Why

El Gerente o el Veterinario necesita retirar de forma definitiva a un cliente de la gestión de la clínica sin perder su información ni la de sus mascotas (**HU-03 · Dar de baja un cliente**, RF-03, Sprint 2). HU-04 y HU-05 ya resolvieron los estados reversibles (`Activo` ↔ `Inactivo`) con un servicio compartido de cambios de estado; falta el estado final `De baja`, que hoy solo puede existir cargado por semilla y que nadie puede asignar desde el sistema.

Documentación funcional de referencia:
- `docs/modulo-1-historial-clinico/historias-usuario/01-clientes.md` (HU-03, RF-03)
- `docs/modulo-1-historial-clinico/matriz-roles-permisos.md` (sección 2.2: «Dar de baja cliente» solo para Gerente y Veterinario → permiso `clients:deactivate`)
- `docs/modulo-1-historial-clinico/diagramas/estados.md` y `diagramas/clases.md` (estado `DadoDeBaja` de `Cliente`, sin transición de salida)

## What Changes

- Ampliar `ChangeClientStatusService` (`vet-manage-api/src/modules/clients/services/change-client-status.service.ts`) con `deactivate(clientId, reason, actorId)`: transición `ACTIVE | INACTIVE → DEACTIVATED`, motivo obligatorio, rechazo si el cliente no existe o ya está de baja, y rechazo si tiene citas futuras pendientes.
- Guardar en el cliente la fecha, el usuario responsable y el motivo de la baja (`Client.deactivatedAt`, `Client.deactivatedById`, `Client.deactivationReason`). **Requiere migración** de Prisma en `prisma/schema/identity.prisma` (se avisa al grupo antes de crearla, regla 4 de la estructura del proyecto).
- Consultar las citas pendientes a través de un servicio del dominio de agenda (`scheduling`), no de su tabla: nuevo `PendingAppointmentsService.countFutureByClient(clientId)` que cuenta citas `PROGRAMADA` o `CONFIRMADA` con `fechaHora` posterior a ahora de los pacientes del cliente. Se coordina con el responsable del Módulo 2.
- Exponer `PATCH /api/v1/clients/:clientId/deactivate` con cuerpo `{ reason }`, protegido con `@RequirePermissions('clients:deactivate')`.
- Registrar la baja en la auditoría, en la misma transacción, con la nueva acción del catálogo **"Dar de baja"**, módulo "Clientes", valor anterior `{ status }` y valor nuevo `{ status: "De baja", reason }`.
- Mostrar la información de un cliente de baja (datos, motivo, fecha, responsable y mascotas) en modo solo lectura: sin acciones de edición, inactivación ni activación.
- Mantener bloqueado al cliente de baja en nuevas transacciones del Módulo 1 (registro de pacientes y selector de clientes) con el mensaje «El cliente está dado de baja».
- Frontend (`ClientsPage`): acción **Dar de baja** solo con `clients:deactivate` y para clientes `Activo` o `Inactivo`; modal de confirmación con transición `Activo/Inactivo → De baja`, motivo obligatorio, aviso de citas pendientes y botón «Cancelar» que no cambia nada.

## Capabilities

### New Capabilities
- `client-deactivation`: Baja definitiva de clientes en la API (`PATCH /api/v1/clients/:clientId/deactivate`): motivo obligatorio, bloqueo por citas futuras pendientes, datos de la baja guardados, consulta en solo lectura y bloqueo en nuevas transacciones; protegida con `clients:deactivate`.
- `client-deactivation-ui`: Acción «Dar de baja» en el listado y la ficha de clientes con modal de confirmación, motivo obligatorio, cancelación sin cambios, aviso de citas pendientes, visibilidad según permiso y vista en solo lectura de un cliente de baja.

### Modified Capabilities
- `audit-log`: Agregar la acción del catálogo "Dar de baja" y auditar la baja de un cliente con su estado anterior, el nuevo estado y el motivo.

## Impact

- **Base de datos (`vet-manage-api/prisma`)**: migración que agrega `deactivated_at`, `deactivated_by_id` (FK a `users`, `onDelete: Restrict`) y `deactivation_reason` a `clients`. No modifica datos existentes.
- **Backend (`vet-manage-api`)**:
  - `src/modules/clients/services/change-client-status.service.ts` y su `.spec.ts`.
  - `src/modules/clients/routes/clients.controller.ts` y su `.spec.ts`; nuevo DTO `dtos/deactivate-client.dto.ts`.
  - `src/modules/clients/clients.module.ts` (importar el módulo de agenda que exporte `PendingAppointmentsService`).
  - `src/modules/scheduling/…/pending-appointments.service.ts` (nuevo, dominio de agenda; coordinado con el Módulo 2).
  - `src/modules/audit/audit.catalog.ts` (acción `deactivate: 'Dar de baja'`).
  - `src/modules/clients/repositories/clients.repository.ts` y `dtos/client-response.dto.ts` (exponer los datos de la baja).
- **Frontend (`vet-manage-frontend`)**: `src/modules/clients/types.ts`, `services/clients-api.ts`, `pages/clients-page.tsx`, `clients-page.css` y sus pruebas.
- **Fuera de alcance**: facturas y atenciones médicas todavía no existen en el sistema; cuando existan, sus módulos deberán respetar el estado `DEACTIVATED` (ver diseño). No hay reactivación de un cliente de baja (estado final del diagrama de estados).
