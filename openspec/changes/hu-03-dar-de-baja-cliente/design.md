## Context

- `Client` (`prisma/schema/identity.prisma`) solo guarda `status` (`RecordStatus`: `ACTIVE`, `INACTIVE`, `DEACTIVATED`); no tiene dónde registrar la fecha, el responsable ni el motivo de una baja. `User` ya resolvió lo mismo con `deactivatedAt` y `deactivationReason`.
- `ChangeClientStatusService` (HU-04/HU-05) centraliza las transiciones reversibles `ACTIVE ↔ INACTIVE` con transacción Prisma y `AuditService.record`. Ya rechaza clientes `DEACTIVATED` con `400`.
- `UpdateClientService` (HU-02) ya rechaza editar un cliente `DEACTIVATED` (`409`), y `RegisterPatientService` (HU-07) ya rechaza clientes que no estén `ACTIVE` (`409`).
- El permiso `clients:deactivate` existe en `clinical.permissions.ts` y solo lo tienen Gerente y Veterinario (`roles.catalog.ts`), igual que la matriz de roles (sección 2.2).
- Las citas (`Cita`, `prisma/schema/agendamiento.prisma`) pertenecen al dominio de agenda (`src/modules/scheduling`, Módulo 2). Estados: `PROGRAMADA`, `CONFIRMADA`, `EN_CURSO`, `FINALIZADA`, `CANCELADA`, `NO_ASISTIO`. Hoy ningún servicio de agenda expone las citas de un cliente.
- Auditoría (HT-04): `AuditLog` con `previousValue` / `newValue` en JSON, escritura en la misma transacción y catálogo compartido en `src/modules/audit/audit.catalog.ts`.

## Goals / Non-Goals

**Goals:**
- `PATCH /api/v1/clients/:clientId/deactivate` con motivo obligatorio, bloqueo por citas pendientes y auditoría atómica.
- Guardar fecha, responsable y motivo de la baja en el propio cliente y mostrarlos en su ficha en solo lectura.
- Acción «Dar de baja» en `ClientsPage` con confirmación, cancelación y visibilidad por permiso.

**Non-Goals:**
- Reactivar un cliente de baja: el diagrama de estados define `DadoDeBaja` como estado final.
- Facturas y atenciones médicas: todavía no existen. Cuando se implementen (Módulo 3 y HU-29/HU-30), sus servicios deben rechazar clientes `DEACTIVATED` usando `ClientsService.findById`; queda anotado como dependencia.
- Bloquear el agendamiento de citas para clientes de baja: lo implementa el Módulo 2 al construir el registro de citas.

## Decisions

1. **Datos de la baja en `Client`, no solo en la auditoría**
   - *Decisión:* migración que agrega `deactivatedAt DateTime?`, `deactivatedById String? @db.Uuid` (relación a `User`, `onDelete: Restrict`) y `deactivationReason String? @db.VarChar(500)`.
   - *Alternativa:* leerlos de `audit_logs`. Se descarta porque la ficha del cliente tendría que consultar la auditoría (que es de solo lectura y para el Administrador) y porque el criterio pide guardarlos con el cliente.
   - *Regla del equipo:* solo una persona cambia el esquema a la vez; se avisa al grupo antes de crear la migración.

2. **Reutilizar `ChangeClientStatusService` con un método `deactivate`**
   - *Decisión:* agregar `deactivate(clientId, reason, actorId)` al servicio existente, en lugar de crear otro servicio. HU-04 lo diseñó como el servicio compartido de estados de clientes (`change-client-status.service.ts` cubre HU-03, HU-04 y HU-05 según `estructura-carpetas`).
   - *Orden de validación:* motivo (`400`) → cliente existe (`404`) → ya de baja (`409`) → citas pendientes (`409`) → actualizar y auditar en la misma transacción.

3. **Citas pendientes mediante un servicio del dominio de agenda**
   - *Decisión:* nuevo `PendingAppointmentsService` en `src/modules/scheduling/appointments/` (exportado por su módulo) con `countFutureByClient(clientId, now)`, que cuenta citas `PROGRAMADA` o `CONFIRMADA` con `fechaHora > now` de los pacientes del cliente. `ClientsModule` lo importa.
   - *Alternativa:* consultar `prisma.cita` desde `clients`. Se descarta por la regla 2 de la estructura del proyecto (no consultar tablas de otro dominio).
   - *Coordinación:* la carpeta pertenece al Módulo 2; el archivo se crea avisando a su responsable (regla 1). Para evitar una dependencia circular, el servicio solo depende de `PrismaService`.
   - *Concurrencia:* la consulta y la actualización se hacen dentro de la misma transacción; el riesgo de que se agende una cita en ese instante queda cubierto cuando el Módulo 2 valide el estado del cliente al agendar.

4. **Auditoría con la nueva acción "Dar de baja"**
   - *Decisión:* agregar `deactivate: 'Dar de baja'` a `AUDIT_ACTIONS` y registrar `{ action: deactivate, module: clients, affectedRecord: describePerson(person), previousValue: { status: 'Activo' | 'Inactivo' }, newValue: { status: 'De baja', reason } }`.
   - *Alternativa:* reutilizar "Inactivar". Se descarta porque la baja es definitiva y debe poder filtrarse aparte en la consulta de auditoría (HU-60).

5. **Frontend**
   - *Decisión:* botón de icono «Dar de baja» en la fila (como «Inactivar» y «Activar»), modal propio con campo de motivo (`textarea`, contador de 500), transición `Activo/Inactivo → De baja` y aviso de acción definitiva. Los clientes `DEACTIVATED` ocultan todas las acciones de cambio y muestran en su detalle los datos de la baja.
   - Validación del motivo en cliente y servidor (mismo mensaje).

## Risks / Trade-offs

- [Cambio de esquema compartido] → Migración pequeña y aditiva (columnas opcionales); se avisa al grupo y se crea en una rama aparte del resto del trabajo de base de datos.
- [Dependencia con el Módulo 2] → Si el servicio de citas no se acepta a tiempo, se implementa la interfaz `PendingAppointmentsService` con su prueba y se acuerda con el Módulo 2 quién la mantiene.
- [Mensajes distintos entre HU-03 Esc. 5 y HU-07 Esc. 5] → Se mantiene el mensaje ya aceptado de HU-07 hasta que el PO decida (pregunta abierta).
- [Migraciones fuera de orden en bases nuevas (defecto QA DEF-12)] → Crear la migración con `prisma migrate dev` sobre la rama actualizada y verificarla en una base vacía (`prisma migrate reset`).

## Migration Plan

1. `npx prisma migrate dev --name add_client_deactivation` dentro del contenedor `api` (`make up`; PostgreSQL en `55432`, API en `3080`, frontend en `5174`).
2. Verificar en base vacía: `docker compose exec -T api npx prisma migrate reset --force`.
3. Rollback: la migración solo agrega columnas opcionales; revertir es eliminar esas columnas en una migración nueva.

## Open Questions

- ¿El registro de pacientes debe decir «El cliente está dado de baja» (HU-03 Esc. 5) o mantener «El cliente seleccionado no está disponible» (HU-07 Esc. 5)?
- ¿Quién mantiene `PendingAppointmentsService` en el Módulo 2?
- ¿La ficha del cliente debe mostrar el nombre del responsable de la baja a todos los roles con `clients:read`, o solo a Gerente y Veterinario?
