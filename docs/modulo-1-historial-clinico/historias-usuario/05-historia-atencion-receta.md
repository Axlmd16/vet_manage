# Historia clínica, atención y receta

Historias de usuario del Módulo 1 – Historial Clínico (HU-29 a HU-36).

| HU | Nombre | Actor |
| --- | --- | --- |
| HU-29 | Registrar Historia Clínica | Veterinario |
| HU-30 | Registro de atención Clínica | Veterinario |
| HU-31 | Registro de diagnóstico | Veterinario |
| HU-32 | Corrección Atención Clínica | Veterinario |
| HU-33 | Visualización del Historial Clínico | Veterinario |
| HU-34 | Gestión de Receta Médica | Veterinario |
| HU-35 | Consultar Receta Médica | Veterinario |
| HU-36 | Generar Receta Medica en PDF | Veterinario |

## HU-29 · Registrar Historia Clínica

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario | RF-23 |

**Historia**

> Como veterinario quiero registrar los antecedentes y estado actual médicos del paciente (mascota) al momento de su primera consulta, para contar con una visión general de su estado de salud previo y su registro con fecha, hora y usuario.

**Criterios de aceptación**

#### Escenario 1: Registrar antecedentes clínicos con un paciente ya registrado

```gherkin
Dado que el veterinario se encuentra en el apartado de Historial Clínico de una mascota en su primera consulta y existe un paciente registrado en estado “Activo”.
Cuando selecciona al paciente, el sistema genera automáticamente el número de historia clínica, el veterinario ingresa antecedentes con texto descriptivo de entre 10 y 150 caracteres (por ejemplo, "Alergia a penicilina; cirugía de esterilización en 2024; tratamiento previo con antiparasitario") y presione "Guardar".
Entonces el sistema debe almacenar el texto de los antecedentes asociado al historial del paciente seleccionado y registrar la fecha y hora (DD-MM-AAAA HH:mm) y el usuario que inició sesión y se debe mostrar un mensaje de confirmación "Antecedentes registrados exitosamente".
```

#### Escenario 2: Registrar antecedentes clínicos en la primera consulta cuando el paciente aun no existe

```gherkin
Dado que el veterinario se encuentra en el apartado de Historial Clínico de una mascota en su primera consulta y el paciente no se encuentra registrado en el sistema
Cuando el veterinario selecciona la opción “Registrar nuevo paciente” y completa los campos obligatorios del formulario de HU-005 y presiona “Guardar paciente”
Entonces el sistema debe almacenar el texto de los antecedentes asociado al historial del paciente seleccionado y registra la fecha y hora (DD-MM-AAAA HH:mm) y el usuario que inició sesión y se debe mostrar un mensaje de confirmación "Antecedentes registrados exitosamente".
```

#### Escenario 3: Intentar guardar antecedentes vacíos

```gherkin
Dado que el veterinario se encuentra en el apartado de Historial Clínico de una mascota
Cuando intenta guardar los antecedentes sin haber ingresado ningún texto, presionando "Guardar"
Entonces el sistema debe bloquear la acción
Y debe mostrar un mensaje de error indicando que el campo de antecedentes no puede estar vacío.
```

#### Escenario 4: Validación de longitud y formato

```gherkin
Dado que el veterinario se encuentra en el apartado de Historial Clínico
Cuando ingresa un texto con menos de 10 caracteres, maximo 150 o intenta ingresar símbolos: (' ";#--) y presiona "Guardar"
Entonces el sistema debe bloquear la acción y mostrar el mensaje: "El antecedente debe contener al menos 10 - 150 caracteres y texto descriptivo válido".
```

#### Escenario 5: Intento de registro de antecedentes cuando ya existen para el paciente

```gherkin
Dado que el paciente ya cuenta con antecedentes registrados en su historial.
Cuando el veterinario ingresa al apartado de Historial Clínico ingresa la razón y descripción de la corrección, y presiona "Guardar"
Entonces el sistema debe permitir ingresar la razón de la corrección, el cuerpo del antecedente y almacenar la corrección asociada a ese antecedente (llave foránea al ID) y mantener intacta la información original, mostrando ambos antecedentes junto con el ID del usuario que corrige, fecha y hora exacta. Escenario de cancelación de registro de antecedentes
Dado que el veterinario se encuentra completando el formulario de antecedentes.
Cuando presiona "Cancelar" o abandona el formulario sin guardar
Entonces el sistema no almacena ningún dato, no genera el número de historia clínica y no deja registro parcial en el historial. Escenario de contenido no descriptivo
Dado que el veterinario se encuentra registrando antecedentes
Cuando ingresa solo números, solo símbolos o una cadena sin contenido semántico (por ejemplo, "1234567890", "#########",) y presiona "Guardar"
Entonces el sistema debe bloquear la acción
Y debe mostrar el mensaje "El antecedente debe contener al menos 10 caracteres y texto descriptivo válido"
```

---

## HU-30 · Registro de atención Clínica

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario | R-24 |

**Historia**

> Como veterinario quiero registrar los detalles de la atención clínica brindada durante la consulta: razón de cita, diagnóstico, receta, listado de insumos utilizados, observaciones (opcional) y archivos adjuntos (opcional), para dejar constancia del diagnóstico, tratamiento e insumos utilizados en la mascota.

**Criterios de aceptación**

#### Escenario 1: Guardar atención clínica con datos válidos

```gherkin
Dado que el Veterinario se encuentra en la interfaz de Atención Clínica de una cita en estado "En Curso", con paciente y cliente en estado activo.
Cuando ingresa la razón de cita (ejemp:"Malestar desde ayer), el diagnóstico (Gastroenteritis aguda probable) deja observaciones vacías y presiona "Guardar Atención Clínica".
Entonces el sistema debe guardar la atención clínica asociada al paciente, al cliente, a la cita y a la historia clínica, debe registrar automáticamente el usuario, la fecha y la hora (DD-MM-AAAA HH:mm), cambiar el estado de la cita a "Finalizada" y debe mostrar el mensaje "Atención clínica registrada exitosamente"
```

#### Escenario 2: Guardar diagnóstico exitosamente

```gherkin
Dado que el Veterinario se encuentra en la interfaz de Atención Clínica de una cita en estado "En Curso", con paciente, cliente en estado activo y ha registrado el diagnóstico de la Atención Clínica en el modal correspondiente.
Cuando presionar “Guardar Atención clínica”.
Entonces el sistema debe almacenar el diagnóstico asociado a la atención clínica, a la historia clínica del paciente, debe registrar automáticamente el usuario, la fecha y la hora (DD-MM-AAAA HH:mm), cambiar el estado de la cita a "Finalizada" y mostrar el mensaje "Atención clínica registrada exitosamente"
```

#### Escenario 3: Guardar diagnóstico vacío

```gherkin
Dado que el diagnóstico se encuentra vacío
Cuando el veterinario intenta “Guardar Atención Clínica”
Entonces el sistema debe mostrar el mensaje “ El diagnóstico es obligatorio”
```

#### Escenario 4: Abrir modales de receta, insumos y archivos

```gherkin
Dado que el veterinario se encuentra en la interfaz de Atención Clínica
Cuando presiona "Crear Receta", “Agregar Insumo” o “Adjuntar archivo” el sistema debe presentar el modal correspondiente para ingresar datos para secciones de: Receta, Listado de insumos utilizados , Archivos Adjuntos (Opcional), y presiona “Guardar Atención clínica”
Entonces el sistema guarda la receta, el listado de insumos y los archivos adjuntos asociados a la atención clínica y a la historia clínica del paciente.
```

#### Escenario 5: Validar razón de cita vacía

```gherkin
Dado que el veterinario se encuentra en la interfaz de Atención Clínica
Cuando deja vacía la razón de cita y presiona "Guardar Atención Clínica"
Entonces el sistema debe bloquear el guardado y mostrar el mensaje de “La razón de cita es obligatoria”
```

#### Escenario 6: Validar límite de palabras en observaciones

```gherkin
Dado que el veterinario ha ingresado observaciones con más de 100 palabras
Cuando presiona "Guardar Atención Clínica"
Entonces el sistema debe mostrar el mensaje de error "Máximo 100 palabras" el cual al cerrarse muestra el modal junto con la sección de observaciones que han alcanzado las 100 palabras
```

#### Escenario 7: Validar longitud de razón de cita y diagnóstico

```gherkin
Dado que el Veterinario ingresa una razón de cita con menos de 10 o más de 200 caracteres.
Cuando presiona "Guardar Atención Clínica"
Entonces el sistema debe bloquear el guardado y notificar “Limite de caracteres superado en Razón de cita”
```

#### Escenario 8: Intentar registrar atención sobre una cita en estado no válido

```gherkin
Dado que la cita se encuentra en estado "Programada", "Cancelada" o "No asistió"
Cuando el Veterinario intenta registrar una atención clínica
Entonces el sistema debe bloquear la acción y debe mostrar el mensaje "Solo se puede registrar atención de una cita en estado 'En Curso'"
```

#### Escenario 9: Cita ya finalizada

```gherkin
Dado que la cita ya tiene una atención clínica registrada y está "Finalizada”.
Cuando el Veterinario intenta registrar una nueva atención sobre la misma cita.
Entonces el sistema debe impedir el registro duplicado y mostrar la opción de "Corregir" (derivada a HU-20) y debe mostrar el mensaje "La cita ya tiene una atención registrada, puede 'Corregir' para modificarla".
```

#### Escenario 10: Paciente Inactivo

```gherkin
Dado que el paciente asociado está en estado "Inactivo" (HU-07)
Cuando el Veterinario intenta registrar la atención
Entonces el sistema debe bloquear el registro
Y debe mostrar el mensaje "No es posible registrar atención de un paciente inactivo"
```

#### Escenario 11: Concurrencia de 2 usuarios en la misma cita

```gherkin
Dado que dos veterinarios abren la misma atención de la misma cita
Cuando ambos guardan simultáneamente
Entonces el sistema debe aplicar control de concurrencia (bloqueo optimista/pesimista)
Y debe mostrar el mensaje "La atención fue modificada por otro usuario. Recargue la información"
```

#### Escenario 12: Usuario sin permiso

```gherkin
Dado que un usuario con rol distinto de Veterinario (ej. Secretario, Cajero) intenta registrar una atención.
Cuando accede a la interfaz
Entonces el sistema no debe mostrar la opción o debe bloquear la acción y debe mostrar el mensaje "No tiene permisos para registrar atenciones clínicas"
```

---

## HU-31 · Registro de diagnóstico

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario | RF-24 |

**Historia**

> Como veterinario quiero registrar el diagnóstico médico de la mascota durante una consulta para mantener un seguimiento del avance clínico del paciente, dejando constancia del autor, la fecha y la hora.

**Criterios de aceptación**

#### Escenario 1: Guardar diagnóstico exitosamente

```gherkin
Dado que el Veterinario se encuentra en el modal de Diagnóstico de una Atención Clínica en estado "En Curso", con paciente y cliente activos
Cuando ingresa el diagnóstico "Gastroenteritis aguda probable. Se indica hidratación y dieta blanda" y presiona "Guardar"
Entonces el sistema debe almacenar el diagnóstico asociado a la Atención Clínica y a la Historia Clínica del paciente cuando el veterinario presiona “Guardar Atención clínica”(HU-18) debe registrar automáticamente el usuario, la fecha y la hora (DD-MM-AAAA HH:mm) y mostrar el mensaje "Diagnóstico registrado exitosamente".
```

#### Escenario 2: Intentar guardar diagnóstico vacío

```gherkin
Dado que el campo de diagnóstico se encuentra vacío
Cuando el veterinario intenta guardar
Entonces el sistema debe mostrar un mensaje de error indicando que el campo es obligatorio.
```

#### Escenario 3: Validar longitud del diagnóstico

```gherkin
Dado que el Veterinario ingresa un diagnóstico con menos de 10 caracteres o mayor a 500.
Cuando presiona "Guardar"
Entonces el sistema debe bloquear el guardado
Y debe mostrar el mensaje "El diagnóstico debe contener al menos 10 caracteres descriptivos" / "El diagnóstico debe contener menos de 500 caracteres descriptivos".
```

---

## HU-32 · Corrección Atención Clínica

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario | RF-25 |

**Historia**

> Como veterinario quiero registrar una corrección sobre una Atención Clínica ya guardada, para rectificar la información sin necesidad de eliminar el registro original y mantener la trazabilidad del historial del paciente.

**Criterios de aceptación**

#### Escenario 1: Registrar corrección exitosamente

```gherkin
Dado que el veterinario se encuentra visualizando una Atención Clínica previamente registrada de una atencion clínica en estado de “Finalizada”
Cuando selecciona la opción de "Corregir" e ingresa la razón y descripción de la corrección, y presiona "Guardar"
Entonces el sistema debe almacenar la corrección asociada a esa Atención Clínica (llave foránea al ID) y mantener intacta la información original, mostrando ambas en el historial junto con el ID del usuario que corrige, fecha y hora exacta (DD-MM-AAAA HH:mm).
```

#### Escenario 2: Intentar guardar corrección sin datos obligatorios

```gherkin
Dado que el veterinario se encuentra en el formulario de corrección
Cuando deja vacíos los campos de motivo de correción o descripción y presiona "Guardar"
Entonces el sistema debe bloquear la acción y mostrar un mensaje de error solicitando completar los campos requeridos.
```

#### Escenario 3: Visualizar Historial de correcciones

```gherkin
Dado que una Atención Clínica ya cuenta con una o más correcciones asociadas.
Cuando el veterinario visualiza el Historial Clínico del paciente.
Entonces el sistema debe mostrar la Atención Clínica Original en su estado inicial.
Y debe mostrar las correcciones como registros secundarios vinculados visualmente, permitiendo expandir o contrastar la información original versus la corregida.
```

---

## HU-33 · Visualización del Historial Clínico

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario | RF-26 |

**Historia**

> Como veterinario quiero visualizar el historial clínico completo de la mascota, para analizar su evolución médica y tomar decisiones informadas sobre su tratamiento.

**Criterios de aceptación**

#### Escenario 1: Visualizar historial clínico ordenado

```gherkin
Dado que el veterinario abre el Historial Clínico de un paciente mostrando sus datos (Nombre del Paciente, Primer Nombre del Cliente, Primer Apellido del Cliente, Número de Historia Clínica, Antecedentes, Estado Actual, Línea de Tiempo: (Atenciones Clínicas, Procedimientos y Esquemas de Vacunación) y Correcciones que se hayan registrado a una atención clínica).
Cuando el sistema carga la información
Entonces el veterinario debe poder ver los antecedentes, estado actual, citas, tratamientos y procedimientos
Y estos deben mostrarse ordenados de la fecha más reciente a la más antigua.
```

#### Escenario 2: Visualizar historial clínico ordenado

```gherkin
Dado que el veterinario abre el Historial Clínico de un paciente que no tiene atenciones clínicas registradas ya sea primera consulta o registro reciente.
Cuando el sistema carga la información
Entonces el sistema debe mostrar los datos generales del paciente (Nombre, Dueño, Número de Historia Clínica, etc.).
Y en el área de la línea de tiempo, el sistema debe mostrar un Empty State (estado vacío) con un mensaje claro que indique: "El paciente no cuenta con atenciones clínicas registradas hasta la fecha".
```

---

## HU-34 · Gestión de Receta Médica

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario | RF-27, RF-28, RF-29, RF-30 |

**Historia**

> Como veterinario quiero registrar, editar, agregar y retirar medicamentos en una receta en elaboración durante la atención clínica, para definir con precisión la prescripción que recibirá el paciente antes de finalizar la consulta.

**Criterios de aceptación**

#### Escenario 1: Registrar la receta médica asociada a la atención

```gherkin
Dado que el veterinario ha terminado de agregar los medicamentos de la receta y haya ingresado indicaciones generales observaciones ( máximo 100 caracteres)
Cuando presiona “Guardar receta médica”(HU-18).
Entonces el sistema debe almacenar la receta completa asociada al paciente y a la atención clínica correspondiente y debe registrar automáticamente el usuario, la fecha y la hora (DD-MM-AAAA HH:mm)
```

#### Escenario 2: Agregar un medicamento a la receta

```gherkin
Dado que el veterinario se encuentra en el apartado de Receta Médica dentro de una atención clínica activa
Cuando ingresa los datos obligatorios de un medicamento a una receta en elaboración: (nombre, presentación, concentración (opcional), dosis con su unidad de medida, via de administración, frecuencia y duración del tratamiento) y presione "Agregar"
Entonces el sistema debe incluir el medicamento en el listado de la receta actual, mostrar la fecha de emisión y el veterinario responsable.
```

#### Escenario 3: Modificar un medicamento de la receta antes de finalizar

```gherkin
Dado que el veterinario tiene un medicamento registrado en el listado de la receta actual
Cuando selecciona la opción de editar, modifica los datos (nombre, presentación, concentración (opcional), dosis con su unidad de medida, via de administración, frecuencia y duración del tratamiento) y presiona "Actualizar"
Entonces el sistema debe reflejar los cambios en el listado de la receta.
```

#### Escenario 4: Intentar modificar receta con atención finalizada

```gherkin
Dado que el veterinario intenta acceder a la edición de una receta
Cuando la atención clínica a la que pertenece ya ha sido marcada como "Finalizada"
Entonces el sistema debe bloquear la opción de edición (mostrándola en modo solo lectura).
```

#### Escenario 5: Intentar modificar receta con atención “En curso”

```gherkin
Dado que el veterinario intenta acceder a la edición de una receta
Cuando la atención clínica a la que pertenece esta en estado "En curso"
Entonces el sistema debe permitir actualizar: nombre del medicamento, presentación, concentración, dosis, vía de administración, frecuencia, duración, indicaciones generales y observaciones y reflejar los cambios en la receta modificada
```

#### Escenario 6: Retirar un medicamento de la receta

```gherkin
Dado que el veterinario tiene múltiples medicamentos registrados en el listado de la receta actual.
Cuando selecciona la opción de "Retirar" o "Eliminar" sobre uno de los medicamentos y confirma la acción.
Entonces el sistema debe eliminar únicamente ese medicamento del listado y debe conservar intactos los demás medicamentos que forman parte de la receta.
```

---

## HU-35 · Consultar Receta Médica

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario | RF-31 |

**Historia**

> Como veterinario quiero consultar las recetas médicas previamente registradas desde la atención clínica o el historial del paciente, para revisar las prescripciones y el tratamiento indicado cuando sea necesario.

**Criterios de aceptación**

#### Escenario 1: Visualizar detalle de una receta desde el historial

```gherkin
Dado que el veterinario se encuentra en el historial clínico de un paciente
Cuando selecciona una prescripción o receta registrada
Entonces el sistema debe mostrar la receta médica detallada
Y debe incluir la fecha de emisión, el paciente asociado, el veterinario responsable, el listado de medicamentos con: su presentación, dosis, frecuencia y las indicaciones.
```

#### Escenario 2: Consultar receta sin medicamentos registrados

```gherkin
Dado que el veterinario intenta consultar una receta que fue guardada sin medicamentos (si el sistema lo permite)
Cuando abre el detalle
Entonces el sistema debe mostrar el encabezado de la receta (fecha, paciente) y un mensaje indicando que no hay medicamentos registrados en esa prescripción.
```

---

## HU-36 · Generar Receta Medica en PDF

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario | RF-32 |

**Historia**

> Como veterinario quiero generar una copia en formato PDF de una receta médica registrada, para entregar una prescripción impresa o digital al propietario del paciente.

**Criterios de aceptación**

#### Escenario 1: Generar PDF de una receta válida

```gherkin
Dado que el veterinario se encuentra visualizando una receta médica guardada que contiene: fecha de emisión, el paciente asociado, el veterinario responsable, el listado de medicamentos con: su presentación, dosis, frecuencia y las indicaciones generales.
Cuando presiona la opción "Generar PDF" o "Descargar Receta"
Entonces el sistema debe generar un archivo en formato PDF con los datos de la receta (fecha, datos del paciente, propietario, veterinario, medicamentos : presentación, dosis, frecuencia e indicaciones)
Y debe iniciar la descarga del archivo o abrir una vista previa para su impresión.
```

#### Escenario 2: Intentar generar PDF de una receta vacía o incompleta

```gherkin
Dado que el veterinario se encuentra visualizando una receta médica que no cuenta con medicamentos registrados o no tiene dosis, frecuencia ni indicaciones incompletas.
Cuando presiona la opción "Generar PDF"
Entonces el sistema debe bloquear la generación del documento
Y debe mostrar un mensaje de error indicando que "La receta debe tener al menos un medicamento y sus instrucciones completas para generar el PDF".
```

---
