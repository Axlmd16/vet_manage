# language: es
@HU-51
Característica: HU-51 Registrar usuario
  Como Administrador, quiero registrar a los usuarios del personal con uno o más roles,
  para que puedan acceder al sistema según sus funciones.

  @CP-51-01
  Escenario: Escenario 1 - Registro exitoso con un rol
    Dado que el "Administrador" se encuentra en el formulario de registro de personal
    Cuando ingresa cédula "1105019622", nombres "Lucía", apellidos "Benítez", correo "lucia.benitez@vetmanage.test" y teléfono "0991112233"
    Y selecciona el rol "Veterinario" y presiona "Guardar usuario"
    Entonces debe mostrar el mensaje "Usuario registrado correctamente"
    Y la cuenta "lucia.benitez@vetmanage.test" debe quedar en estado "ACTIVE" con el rol "veterinarian"
    Y debe enviar las credenciales al correo "lucia.benitez@vetmanage.test"

  @CP-51-14
  Escenario: Escenario 9 - Usuario sin permiso
    Dado que un "Recepcionista" inició sesión
    Cuando intenta abrir el formulario de registro de personal
    Entonces el sistema debe mostrar el mensaje "No tiene permisos para realizar esta acción"
