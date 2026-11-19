# language: es
@HU-57
Característica: HU-57 Iniciar sesión
  Como usuario con cuenta, quiero iniciar sesión con mi correo y contraseña,
  para acceder de forma segura a las funciones de mis roles.

  @CP-57-01
  Escenario: Escenario 1 - Inicio de sesión exitoso
    Dado que el "Veterinario" tiene una cuenta activa
    Cuando ingresa su correo y la contraseña "QaVet2026" y presiona "Iniciar sesión"
    Entonces el sistema debe iniciar la sesión
    Y debe mostrar la pantalla principal con la opción "Pacientes"

  @CP-57-05
  Escenario: Escenario 5 - Bloqueo por intentos fallidos
    Dado que el usuario "qa.bloqueo@vetmanage.test" ha fallado 4 intentos consecutivos de inicio de sesión
    Cuando falla el quinto intento
    Entonces el sistema debe mostrar el mensaje "Cuenta bloqueada temporalmente. Intente en 15 minutos"
    Y con la contraseña correcta el acceso sigue bloqueado
