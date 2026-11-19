# language: es
@HU-01
Característica: HU-01 Registrar datos del cliente
  Como Recepcionista, Veterinario o Gerente quiero registrar un cliente
  para identificarlo sin duplicados y poder asociar sus mascotas.

  @CP-01-01
  Escenario: Escenario 1 - Registro exitoso de un cliente con datos válidos
    Dado que el "Recepcionista" se encuentra en el formulario de registro de cliente
    Cuando ingresa cédula "1105020364", nombres "Sofía", apellidos "Granda", teléfono "0987001122" y correo "sofia.granda@correo.test"
    Y presiona "Guardar cliente"
    Entonces el cliente "1105020364" debe quedar guardado con estado "ACTIVE"
    Y debe mostrar el mensaje "Cliente registrado exitosamente"
