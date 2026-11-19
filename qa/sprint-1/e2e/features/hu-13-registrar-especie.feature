# language: es
@HU-13
Característica: HU-13 Registrar especie

  @CP-13-01
  Escenario: Escenario 1 - Registro exitoso de una especie
    Dado que el "Veterinario" accede al módulo de gestión de especies
    Cuando ingresa el nombre "Camélido", la descripción "Llamas y alpacas" y selecciona "Guardar especie"
    Entonces debe mostrar el mensaje "Especie registrada exitosamente"
    Y la especie "Camélido" debe estar disponible en el catálogo

  @CP-13-05
  Escenario: Escenario 4 - Cancelación del registro
    Dado que el "Veterinario" accede al módulo de gestión de especies
    Cuando ingresa el nombre "Insecto" y selecciona "Cancelar"
    Entonces la especie "Insecto" no debe estar en el catálogo
