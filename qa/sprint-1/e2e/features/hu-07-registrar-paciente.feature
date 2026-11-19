# language: es
@HU-07
Característica: HU-07 Registrar datos del paciente

  @CP-07-01
  Escenario: Escenario 1 - Registro exitoso de un paciente con datos válidos
    Dado que el "Recepcionista" se encuentra en el formulario de registro de pacientes
    Cuando ingresa nombre "Kira", especie "Felino", raza "Siamés", sexo "Hembra", nacimiento "15032023", peso "3.9" y talla "24"
    Y selecciona al cliente "Ordóñez" y presiona "Guardar"
    Entonces debe mostrar el mensaje "Paciente registrado exitosamente"
    Y el paciente "Kira" debe quedar "ACTIVE" con un código "PAC-######" generado
