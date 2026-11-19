# language: es
@HU-54
Característica: HU-54 Asignar y quitar roles al usuario

  @CP-54-01
  Escenario: Escenario 1 - Asignar un rol adicional
    Dado que "Carlos Pérez" tiene el rol "Recepcionista"
    Cuando el "Administrador" le asigna el rol "Cajero" y presiona "Guardar cambios"
    Entonces debe mostrar el mensaje "Roles actualizados correctamente"
    Y en su siguiente inicio de sesión Carlos debe tener los roles "cashier,receptionist"
