# Vacunación y desparasitación

Historias de usuario del Módulo 1 – Historial Clínico (HU-21 a HU-28).

| HU | Nombre | Actor |
| --- | --- | --- |
| HU-21 | Registro de vacunación | Veterinario o técnico veterinario |
| HU-22 | Edición de vacunación con registro automático de cambios | Veterinario o técnico veterinario |
| HU-23 | Consulta de vacunaciones | Veterinario o técnico veterinario |
| HU-24 | Anulación de vacunación | Veterinario o técnico veterinario |
| HU-25 | Registro de desparasitación | Veterinario o técnico veterinario |
| HU-26 | Edición de desparasitación con registro automático de cambios | Veterinario o técnico veterinario |
| HU-27 | Consulta de desparasitaciones | Veterinario o técnico veterinario |
| HU-28 | Anulación de desparasitación | Veterinario o técnico veterinario |

## HU-21 · Registro de vacunación

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario o técnico veterinario | RF-27, RF-28, RF-32, RF-35 |

**Historia**

> Como veterinario o técnico veterinario, quiero registrar una vacunación de un paciente con los siguientes datos: fecha de aplicación, vacuna, laboratorio, lote y dosis, y de forma opcional la fecha de la próxima vacuna y las observaciones, para llevar el control de su esquema de vacunación.

**Criterios de aceptación**

#### Escenario 1: Registro exitoso de la vacunación con datos válidos

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de registro de vacunación de un paciente
Cuando ingresa la fecha de aplicación "15-05-2026", la vacuna "Rabia", el laboratorio, el lote "A123" y la dosis "1 ml", y presiona el botón "Guardar"
Entonces el sistema debe guardar la vacunación en el historial del paciente
Y debe mostrar el mensaje "Vacunación registrada exitosamente"
Y debe mostrar la vacunación en la lista de vacunaciones del paciente
```

#### Escenario 2: Registro sin campos opcionales

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de registro de vacunación de un paciente
Cuando ingresa la fecha de aplicación, la vacuna, el laboratorio, el lote y la dosis, deja vacíos la fecha de la próxima vacuna y las observaciones y presiona el botón "Guardar"
Entonces el sistema debe guardar la vacunación sin exigir los campos opcionales
Y debe mostrar el mensaje "Vacunación registrada exitosamente"
```

#### Escenario 3: Omitir campos obligatorios

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de registro de vacunación de un paciente
Cuando deja en blanco uno o más campos obligatorios (fecha de aplicación, vacuna, laboratorio, lote o dosis) y presiona el botón "Guardar"
Entonces el sistema debe detener el guardado del registro
Y debe resaltar los campos vacíos y mostrar el mensaje "Por favor, complete todos los campos obligatorios"
```

#### Escenario 4: Validar que la fecha de aplicación no sea futura

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de registro de vacunación de un paciente
Cuando ingresa una fecha de aplicación posterior a la fecha actual y presiona el botón "Guardar"
Entonces el sistema debe rechazar el registro
Y debe resaltar el campo de fecha y mostrar el mensaje "La fecha de aplicación no puede ser posterior a la fecha actual"
```

#### Escenario 5: Validar la fecha de la próxima vacuna

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de registro de vacunación de un paciente
Cuando ingresa una fecha de la próxima vacuna igual o anterior a la fecha de aplicación y presiona el botón "Guardar"
Entonces el sistema debe rechazar el registro
Y debe resaltar el campo de fecha de la próxima vacuna y mostrar el mensaje "La fecha de la próxima vacuna debe ser posterior a la fecha de aplicación"
```

#### Escenario 6: Validar el formato de la dosis

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de registro de vacunación de un paciente
Cuando ingresa una dosis sin cantidad mayor a cero o sin unidad de medida (por ejemplo, "0 ml" o "abc") y presiona el botón "Guardar"
Entonces el sistema debe rechazar el registro
Y debe resaltar el campo dosis y mostrar el mensaje "La dosis debe ser una cantidad mayor a cero con su unidad (ml, mg, tableta o dosis)"
```

#### Escenario 7: Validar el formato del lote

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de registro de vacunación de un paciente
Cuando ingresa un lote con espacios o símbolos (por ejemplo, "A 12#") o con más de 20 caracteres y presiona el botón "Guardar"
Entonces el sistema debe rechazar el registro
Y debe resaltar el campo lote y mostrar el mensaje "El lote solo admite letras, números y guiones, hasta 20 caracteres"
```

#### Escenario 8: Registro automático del usuario y de la fecha y hora de registro

```gherkin
Dado que el veterinario o técnico veterinario ha iniciado sesión y completa el formulario de registro de vacunación con datos válidos
Cuando presiona el botón "Guardar"
Entonces el sistema debe asociar a la vacunación el nombre del usuario que inició sesión como responsable de la aplicación
Y debe registrar la fecha y hora del registro (DD-MM-AAAA HH:mm)
Y no debe permitir modificar esos datos manualmente
```

#### Escenario 9: Visualizar el peso vigente del paciente

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en la ficha de un paciente con peso registrado
Cuando abre el formulario de registro de vacunación
Entonces el sistema debe mostrar de forma destacada el peso vigente del paciente en el encabezado del formulario
```

---

## HU-22 · Edición de vacunación con registro automático de cambios

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario o técnico veterinario | RF-29, RF-34 |

**Historia**

> Como veterinario o técnico veterinario, quiero editar los datos de una vacunación registrada (fecha de aplicación, vacuna, laboratorio, lote, dosis, fecha de la próxima vacuna y observaciones) y que el sistema registre automáticamente los cambios realizados en un historial de cambios que no se pueda editar, para conservar la trazabilidad clínica del esquema de vacunación del paciente.

**Criterios de aceptación**

#### Escenario 1: Actualización exitosa de la vacunación

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de edición de la vacunación registrada de un paciente
Cuando modifica uno o varios datos (fecha de aplicación, vacuna, laboratorio, lote, dosis, fecha de la próxima vacuna o observaciones) y presiona el botón "Guardar cambios"
Entonces el sistema debe actualizar los datos de la vacunación en la base de datos
Y debe mostrar el mensaje "Vacunación actualizada correctamente"
```

#### Escenario 2: Datos que no se pueden editar

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de edición de la vacunación registrada de un paciente
Cuando visualiza el usuario que la aplicó y la fecha y hora de registro
Entonces el sistema debe mostrar esos datos en modo solo lectura
Y no debe permitir modificarlos
```

#### Escenario 3: Registro automático de los cambios en el historial de cambios

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de edición de la vacunación registrada de un paciente
Cuando modifica el campo lote de "A123" a "B456" y presiona el botón "Guardar cambios"
Entonces el sistema debe registrar automáticamente en el historial de cambios de la vacunación el campo modificado, el valor anterior, el valor nuevo, el usuario que realizó la modificación y la fecha y hora del cambio (DD-MM-AAAA HH:mm)
Y debe mostrar en el historial el detalle del cambio (Lote: "A123" cambia a "B456")
```

#### Escenario 4: Conservar los cambios anteriores en el historial

```gherkin
Dado que el veterinario o técnico veterinario edita una vacunación que ya tiene cambios registrados en el historial de cambios
Cuando realiza una nueva modificación y presiona el botón "Guardar cambios"
Entonces el sistema debe agregar el nuevo cambio a continuación de los anteriores
Y no debe sobrescribir ni eliminar los cambios previos
```

#### Escenario 5: Editar las observaciones sin alterar el historial de cambios

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de edición de la vacunación registrada de un paciente
Cuando modifica el contenido del campo observaciones y presiona el botón "Guardar cambios"
Entonces el sistema debe actualizar las observaciones y registrar ese cambio como una nueva entrada del historial de cambios
Y no debe permitir modificar ni eliminar manualmente las entradas anteriores del historial de cambios
Y debe mostrar el historial de cambios en modo solo lectura
```

#### Escenario 6: Guardar sin realizar cambios

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de edición de la vacunación registrada de un paciente
Cuando presiona el botón "Guardar cambios" sin haber modificado ningún dato
Entonces el sistema no debe agregar ninguna entrada al historial de cambios
Y debe mostrar el mensaje "No se detectaron cambios para guardar"
```

#### Escenario 7: Omitir campos obligatorios durante la edición

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de edición de la vacunación registrada de un paciente
Cuando borra o deja en blanco uno o más campos obligatorios (fecha de aplicación, vacuna, laboratorio, lote o dosis) y presiona el botón "Guardar cambios"
Entonces el sistema debe detener la actualización de la vacunación
Y debe resaltar los campos vacíos, conservar los datos previamente registrados y mostrar el mensaje "Por favor, complete todos los campos obligatorios"
Y no debe agregar ninguna entrada al historial de cambios
```

#### Escenario 8: Validar las fechas durante la edición

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de edición de la vacunación registrada de un paciente
Cuando ingresa una fecha de aplicación posterior a la fecha actual, o una fecha de la próxima vacuna igual o anterior a la fecha de aplicación, y presiona el botón "Guardar cambios"
Entonces el sistema debe rechazar la actualización
Y debe resaltar los campos con error y mostrar el mensaje "Las fechas ingresadas no son válidas"
Y debe conservar los datos previamente registrados
```

#### Escenario 9: Validar el formato de la dosis y del lote durante la edición

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de edición de la vacunación registrada de un paciente
Cuando ingresa una dosis sin cantidad mayor a cero o sin unidad (por ejemplo, "0 ml") o un lote con espacios o símbolos (por ejemplo, "A 12#") y presiona el botón "Guardar cambios"
Entonces el sistema debe rechazar la actualización
Y debe resaltar los campos con error y mostrar los mensajes "La dosis debe ser una cantidad mayor a cero con su unidad (ml, mg, tableta o dosis)" y "El lote solo admite letras, números y guiones, hasta 20 caracteres"
Y debe conservar los datos previamente registrados y no agregar ninguna entrada al historial de cambios
```

#### Escenario 10: Impedir la edición de la vacunación anulada

```gherkin
Dado que la vacunación de un paciente se encuentra en estado "Anulada"
Cuando el veterinario o técnico veterinario intenta editarla
Entonces el sistema no debe permitir modificar sus datos
Y debe mostrar el mensaje "No es posible editar una vacunación anulada"
```

---

## HU-23 · Consulta de vacunaciones

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario o técnico veterinario | RF-30, RF-33 |

**Historia**

> Como veterinario o técnico veterinario, quiero consultar de forma cronológica las vacunaciones de un paciente (fecha de aplicación, vacuna, dosis, fecha de la próxima vacuna, usuario que la aplicó y estado) y revisar el detalle de cada una, para conocer su esquema de vacunación.

**Criterios de aceptación**

#### Escenario 1: Consultar las vacunaciones de un paciente en orden cronológico

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en la ficha de un paciente con vacunaciones registradas con fecha de aplicación "10-03-2026" y "15-05-2026"
Cuando selecciona la sección "Vacunaciones"
Entonces el sistema debe mostrar primero la vacunación con fecha de aplicación "15-05-2026" y después la de "10-03-2026", es decir, de la más reciente a la más antigua
Y debe mostrar por cada una la fecha de aplicación, la vacuna, la dosis, la fecha de la próxima vacuna, el usuario que la aplicó y el estado
```

#### Escenario 2: Ordenar vacunaciones con la misma fecha de aplicación

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en la ficha de un paciente con dos vacunaciones con la misma fecha de aplicación, registradas a las 09:00 y a las 14:30
Cuando selecciona la sección "Vacunaciones"
Entonces el sistema debe mostrar primero la vacunación registrada a las 14:30
Y debe aplicar como criterio de desempate la fecha y hora de registro, de la más reciente a la más antigua
```

#### Escenario 3: Consultar el detalle de la vacunación

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en la lista de vacunaciones de un paciente
Cuando selecciona la vacunación de la lista
Entonces el sistema debe mostrar en el detalle la fecha de aplicación, la vacuna, el laboratorio, el lote, la dosis, la fecha de la próxima vacuna, las observaciones, el usuario que la aplicó, la fecha y hora de registro y el estado
Y debe mostrar el historial de cambios con el campo modificado, el valor anterior, el valor nuevo, el usuario y la fecha y hora de cada modificación
```

#### Escenario 4: Paciente sin vacunaciones registradas

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en la ficha de un paciente sin vacunaciones registradas
Cuando selecciona la sección "Vacunaciones"
Entonces el sistema debe mostrar el mensaje "El paciente no tiene vacunaciones registradas"
```

#### Escenario 5: Identificar vacunaciones anuladas

```gherkin
Dado que un paciente tiene una vacunación con estado "Anulada"
Cuando el veterinario o técnico veterinario consulta la sección "Vacunaciones"
Entonces el sistema debe mostrar la vacunación en la lista, en la posición que le corresponde según su fecha de aplicación, identificada con el estado "Anulada"
Y no debe considerarla parte del esquema de vacunación vigente del paciente
Y debe mostrar en su detalle el motivo, el usuario y la fecha y hora de la anulación
```

---

## HU-24 · Anulación de vacunación

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario o técnico veterinario | RF-31 |

**Historia**

> Como veterinario o técnico veterinario, quiero anular una vacunación registrada por error en un paciente, indicando el motivo de la anulación, para corregir su esquema de vacunación sin eliminar el registro ni perder la trazabilidad.

**Criterios de aceptación**

#### Escenario 1: Anular la vacunación registrada

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el detalle de la vacunación con estado "Activa"
Cuando presiona el botón "Anular vacunación", ingresa el motivo "Registrada en el paciente equivocado" y confirma la acción en el cuadro de confirmación
Entonces el sistema debe cambiar el estado de la vacunación a "Anulada" sin eliminar su registro
Y debe conservar el nombre del usuario que realizó la anulación, la fecha y hora (DD-MM-AAAA HH:mm) y el motivo
Y debe mostrar el mensaje "Vacunación anulada correctamente"
```

#### Escenario 2: Omitir el motivo de la anulación

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el detalle de la vacunación con estado "Activa"
Cuando presiona el botón "Anular vacunación", deja vacío el motivo o solo con espacios y confirma la acción
Entonces el sistema debe detener la anulación y mantener la vacunación en estado "Activa"
Y debe resaltar el campo motivo y mostrar el mensaje "Debe ingresar el motivo de la anulación"
```

#### Escenario 3: Cancelar la anulación

```gherkin
Dado que el veterinario o técnico veterinario presionó el botón "Anular vacunación" y el sistema solicita confirmación
Cuando cancela la acción
Entonces el sistema no debe modificar el estado de la vacunación
Y la vacunación debe permanecer en estado "Activa"
```

#### Escenario 4: Impedir la edición de la vacunación anulada

```gherkin
Dado que la vacunación de un paciente se encuentra en estado "Anulada"
Cuando el veterinario o técnico veterinario intenta editarla
Entonces el sistema no debe permitir modificar sus datos
Y debe mostrar el mensaje "No es posible editar una vacunación anulada"
```

#### Escenario 5: Anular una vacunación que ya está anulada

```gherkin
Dado que la vacunación de un paciente se encuentra en estado "Anulada"
Cuando el veterinario o técnico veterinario intenta anularla nuevamente
Entonces el sistema no debe modificar los datos de la anulación original
Y debe mostrar el mensaje "La vacunación ya se encuentra anulada"
```

#### Escenario 6: Impedir la anulación a un usuario sin permiso

```gherkin
Dado que un usuario con un rol distinto de veterinario o técnico veterinario (por ejemplo, recepcionista) se encuentra en el detalle de la vacunación con estado "Activa"
Cuando intenta anular la vacunación
Entonces el sistema no debe permitir la anulación
Y debe mostrar el mensaje "No tiene permisos para anular vacunaciones"
```

---

## HU-25 · Registro de desparasitación

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario o técnico veterinario | como referencia RF-27, RF-28, RF-32, RF-35 |

**Historia**

> Como veterinario o técnico veterinario, quiero registrar una desparasitación de un paciente con los siguientes datos: fecha de desparasitación, tipo (Interno, Externo o Mixto), producto, lote y dosis, y de forma opcional la fecha de la próxima desparasitación y las observaciones, para mantener al día su esquema de desparasitación.

**Criterios de aceptación**

#### Escenario 1: Registro exitoso de la desparasitación con datos válidos

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de registro de desparasitación de un paciente
Cuando ingresa la fecha de desparasitación "15-05-2026", el tipo "Interno", el producto, el lote "A123" y la dosis "1 tableta", y presiona el botón "Guardar"
Entonces el sistema debe guardar la desparasitación en el historial del paciente
Y debe mostrar el mensaje "Desparasitación registrada exitosamente"
Y debe mostrar la desparasitación en la lista de desparasitaciones del paciente
```

#### Escenario 2: Registro sin campos opcionales

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de registro de desparasitación de un paciente
Cuando ingresa la fecha de desparasitación, el tipo (Interno, Externo o Mixto), el producto, el lote y la dosis, deja vacíos la fecha de la próxima desparasitación y las observaciones y presiona el botón "Guardar"
Entonces el sistema debe guardar la desparasitación sin exigir los campos opcionales
Y debe mostrar el mensaje "Desparasitación registrada exitosamente"
```

#### Escenario 3: Omitir campos obligatorios

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de registro de desparasitación de un paciente
Cuando deja en blanco uno o más campos obligatorios (fecha de desparasitación, tipo, producto, lote o dosis) y presiona el botón "Guardar"
Entonces el sistema debe detener el guardado del registro
Y debe resaltar los campos vacíos y mostrar el mensaje "Por favor, complete todos los campos obligatorios"
```

#### Escenario 4: Validar que la fecha de desparasitación no sea futura

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de registro de desparasitación de un paciente
Cuando ingresa una fecha de desparasitación posterior a la fecha actual y presiona el botón "Guardar"
Entonces el sistema debe rechazar el registro
Y debe resaltar el campo de fecha y mostrar el mensaje "La fecha de desparasitación no puede ser posterior a la fecha actual"
```

#### Escenario 5: Validar la fecha de la próxima desparasitación

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de registro de desparasitación de un paciente
Cuando ingresa una fecha de la próxima desparasitación igual o anterior a la fecha de desparasitación y presiona el botón "Guardar"
Entonces el sistema debe rechazar el registro
Y debe resaltar el campo de fecha de la próxima desparasitación y mostrar el mensaje "La fecha de la próxima desparasitación debe ser posterior a la fecha de desparasitación"
```

#### Escenario 6: Validar el formato de la dosis

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de registro de desparasitación de un paciente
Cuando ingresa una dosis sin cantidad mayor a cero o sin unidad de medida (por ejemplo, "0 tableta" o "abc") y presiona el botón "Guardar"
Entonces el sistema debe rechazar el registro
Y debe resaltar el campo dosis y mostrar el mensaje "La dosis debe ser una cantidad mayor a cero con su unidad (ml, mg, tableta o dosis)"
```

#### Escenario 7: Validar el formato del lote

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de registro de desparasitación de un paciente
Cuando ingresa un lote con espacios o símbolos (por ejemplo, "A 12#") o con más de 20 caracteres y presiona el botón "Guardar"
Entonces el sistema debe rechazar el registro
Y debe resaltar el campo lote y mostrar el mensaje "El lote solo admite letras, números y guiones, hasta 20 caracteres"
```

#### Escenario 8: Registro automático del usuario y de la fecha y hora de registro

```gherkin
Dado que el veterinario o técnico veterinario ha iniciado sesión y completa el formulario de registro de desparasitación con datos válidos
Cuando presiona el botón "Guardar"
Entonces el sistema debe asociar a la desparasitación el nombre del usuario que inició sesión como responsable de la aplicación
Y debe registrar la fecha y hora del registro (DD-MM-AAAA HH:mm)
Y no debe permitir modificar esos datos manualmente
```

#### Escenario 9: Visualizar el peso vigente del paciente

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en la ficha de un paciente con peso registrado
Cuando abre el formulario de registro de desparasitación
Entonces el sistema debe mostrar de forma destacada el peso vigente del paciente en el encabezado del formulario
```

---

## HU-26 · Edición de desparasitación con registro automático de cambios

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario o técnico veterinario | como referencia RF-29, RF-34 |

**Historia**

> Como veterinario o técnico veterinario, quiero editar los datos de una desparasitación registrada (fecha de desparasitación, tipo, producto, lote, dosis, fecha de la próxima desparasitación y observaciones) y que el sistema registre automáticamente los cambios realizados en un historial de cambios que no se pueda editar, para conservar la trazabilidad clínica del esquema de desparasitación del paciente.

**Criterios de aceptación**

#### Escenario 1: Actualización exitosa de la desparasitación

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de edición de la desparasitación registrada de un paciente
Cuando modifica uno o varios datos (fecha de desparasitación, tipo, producto, lote, dosis, fecha de la próxima desparasitación o observaciones) y presiona el botón "Guardar cambios"
Entonces el sistema debe actualizar los datos de la desparasitación en la base de datos
Y debe mostrar el mensaje "Desparasitación actualizada correctamente"
```

#### Escenario 2: Datos que no se pueden editar

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de edición de la desparasitación registrada de un paciente
Cuando visualiza el usuario que realizó la aplicación y la fecha y hora de registro
Entonces el sistema debe mostrar esos datos en modo solo lectura
Y no debe permitir modificarlos
```

#### Escenario 3: Registro automático de los cambios en el historial de cambios

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de edición de la desparasitación registrada de un paciente
Cuando modifica el campo dosis de "1 tableta" a "2 tabletas" y presiona el botón "Guardar cambios"
Entonces el sistema debe registrar automáticamente en el historial de cambios de la desparasitación el campo modificado, el valor anterior, el valor nuevo, el usuario que realizó la modificación y la fecha y hora del cambio (DD-MM-AAAA HH:mm)
Y debe mostrar en el historial el detalle del cambio (Dosis: "1 tableta" cambia a "2 tabletas")
```

#### Escenario 4: Conservar los cambios anteriores en el historial

```gherkin
Dado que el veterinario o técnico veterinario edita una desparasitación que ya tiene cambios registrados en el historial de cambios
Cuando realiza una nueva modificación y presiona el botón "Guardar cambios"
Entonces el sistema debe agregar el nuevo cambio a continuación de los anteriores
Y no debe sobrescribir ni eliminar los cambios previos
```

#### Escenario 5: Editar las observaciones sin alterar el historial de cambios

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de edición de la desparasitación registrada de un paciente
Cuando modifica el contenido del campo observaciones y presiona el botón "Guardar cambios"
Entonces el sistema debe actualizar las observaciones y registrar ese cambio como una nueva entrada del historial de cambios
Y no debe permitir modificar ni eliminar manualmente las entradas anteriores del historial de cambios
Y debe mostrar el historial de cambios en modo solo lectura
```

#### Escenario 6: Guardar sin realizar cambios

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de edición de la desparasitación registrada de un paciente
Cuando presiona el botón "Guardar cambios" sin haber modificado ningún dato
Entonces el sistema no debe agregar ninguna entrada al historial de cambios
Y debe mostrar el mensaje "No se detectaron cambios para guardar"
```

#### Escenario 7: Omitir campos obligatorios durante la edición

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de edición de la desparasitación registrada de un paciente
Cuando borra o deja en blanco uno o más campos obligatorios (fecha de desparasitación, tipo, producto, lote o dosis) y presiona el botón "Guardar cambios"
Entonces el sistema debe detener la actualización de la desparasitación
Y debe resaltar los campos vacíos, conservar los datos previamente registrados y mostrar el mensaje "Por favor, complete todos los campos obligatorios"
Y no debe agregar ninguna entrada al historial de cambios
```

#### Escenario 8: Validar las fechas durante la edición

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de edición de la desparasitación registrada de un paciente
Cuando ingresa una fecha de desparasitación posterior a la fecha actual, o una fecha de la próxima desparasitación igual o anterior a la fecha de desparasitación, y presiona el botón "Guardar cambios"
Entonces el sistema debe rechazar la actualización
Y debe resaltar los campos con error y mostrar el mensaje "Las fechas ingresadas no son válidas"
Y debe conservar los datos previamente registrados
```

#### Escenario 9: Validar el formato de la dosis y del lote durante la edición

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el formulario de edición de la desparasitación registrada de un paciente
Cuando ingresa una dosis sin cantidad mayor a cero o sin unidad (por ejemplo, "0 tableta") o un lote con espacios o símbolos (por ejemplo, "A 12#") y presiona el botón "Guardar cambios"
Entonces el sistema debe rechazar la actualización
Y debe resaltar los campos con error y mostrar los mensajes "La dosis debe ser una cantidad mayor a cero con su unidad (ml, mg, tableta o dosis)" y "El lote solo admite letras, números y guiones, hasta 20 caracteres"
Y debe conservar los datos previamente registrados y no agregar ninguna entrada al historial de cambios
```

#### Escenario 10: Impedir la edición de la desparasitación anulada

```gherkin
Dado que la desparasitación de un paciente se encuentra en estado "Anulada"
Cuando el veterinario o técnico veterinario intenta editarla
Entonces el sistema no debe permitir modificar sus datos
Y debe mostrar el mensaje "No es posible editar una desparasitación anulada"
```

---

## HU-27 · Consulta de desparasitaciones

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario o técnico veterinario | como referencia RF-30, RF-33 |

**Historia**

> Como veterinario o técnico veterinario, quiero consultar de forma cronológica las desparasitaciones de un paciente (fecha de desparasitación, tipo, producto, dosis, fecha de la próxima desparasitación, usuario que realizó la aplicación y estado) y revisar el detalle de cada una, para conocer su esquema de desparasitación.

**Criterios de aceptación**

#### Escenario 1: Consultar las desparasitaciones de un paciente en orden cronológico

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en la ficha de un paciente con desparasitaciones registradas con fecha de desparasitación "10-03-2026" y "15-05-2026"
Cuando selecciona la sección "Desparasitaciones"
Entonces el sistema debe mostrar primero la desparasitación con fecha de desparasitación "15-05-2026" y después la de "10-03-2026", es decir, de la más reciente a la más antigua
Y debe mostrar por cada una la fecha de desparasitación, el tipo, el producto, la dosis, la fecha de la próxima desparasitación, el usuario que realizó la aplicación y el estado
```

#### Escenario 2: Ordenar desparasitaciones con la misma fecha de desparasitación

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en la ficha de un paciente con dos desparasitaciones con la misma fecha de desparasitación, registradas a las 09:00 y a las 14:30
Cuando selecciona la sección "Desparasitaciones"
Entonces el sistema debe mostrar primero la desparasitación registrada a las 14:30
Y debe aplicar como criterio de desempate la fecha y hora de registro, de la más reciente a la más antigua
```

#### Escenario 3: Consultar el detalle de la desparasitación

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en la lista de desparasitaciones de un paciente
Cuando selecciona la desparasitación de la lista
Entonces el sistema debe mostrar en el detalle la fecha de desparasitación, el tipo, el producto, el lote, la dosis, la fecha de la próxima desparasitación, las observaciones, el usuario que realizó la aplicación, la fecha y hora de registro y el estado
Y debe mostrar el historial de cambios con el campo modificado, el valor anterior, el valor nuevo, el usuario y la fecha y hora de cada modificación
```

#### Escenario 4: Paciente sin desparasitaciones registradas

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en la ficha de un paciente sin desparasitaciones registradas
Cuando selecciona la sección "Desparasitaciones"
Entonces el sistema debe mostrar el mensaje "El paciente no tiene desparasitaciones registradas"
```

#### Escenario 5: Identificar desparasitaciones anuladas

```gherkin
Dado que un paciente tiene una desparasitación con estado "Anulada"
Cuando el veterinario o técnico veterinario consulta la sección "Desparasitaciones"
Entonces el sistema debe mostrar la desparasitación en la lista, en la posición que le corresponde según su fecha de desparasitación, identificada con el estado "Anulada"
Y no debe considerarla parte del esquema de desparasitación vigente del paciente
Y debe mostrar en su detalle el motivo, el usuario y la fecha y hora de la anulación
```

---

## HU-28 · Anulación de desparasitación

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario o técnico veterinario | como referencia RF-31 |

**Historia**

> Como veterinario o técnico veterinario, quiero anular una desparasitación registrada por error en un paciente, indicando el motivo de la anulación, para corregir su esquema de desparasitación sin eliminar el registro ni perder la trazabilidad.

**Criterios de aceptación**

#### Escenario 1: Anular la desparasitación registrada

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el detalle de la desparasitación con estado "Activa"
Cuando presiona el botón "Anular desparasitación", ingresa el motivo "Registrada en el paciente equivocado" y confirma la acción en el cuadro de confirmación
Entonces el sistema debe cambiar el estado de la desparasitación a "Anulada" sin eliminar su registro
Y debe conservar el nombre del usuario que realizó la anulación, la fecha y hora (DD-MM-AAAA HH:mm) y el motivo
Y debe mostrar el mensaje "Desparasitación anulada correctamente"
```

#### Escenario 2: Omitir el motivo de la anulación

```gherkin
Dado que el veterinario o técnico veterinario se encuentra en el detalle de la desparasitación con estado "Activa"
Cuando presiona el botón "Anular desparasitación", deja vacío el motivo o solo con espacios y confirma la acción
Entonces el sistema debe detener la anulación y mantener la desparasitación en estado "Activa"
Y debe resaltar el campo motivo y mostrar el mensaje "Debe ingresar el motivo de la anulación"
```

#### Escenario 3: Cancelar la anulación

```gherkin
Dado que el veterinario o técnico veterinario presionó el botón "Anular desparasitación" y el sistema solicita confirmación
Cuando cancela la acción
Entonces el sistema no debe modificar el estado de la desparasitación
Y la desparasitación debe permanecer en estado "Activa"
```

#### Escenario 4: Impedir la edición de la desparasitación anulada

```gherkin
Dado que la desparasitación de un paciente se encuentra en estado "Anulada"
Cuando el veterinario o técnico veterinario intenta editarla
Entonces el sistema no debe permitir modificar sus datos
Y debe mostrar el mensaje "No es posible editar una desparasitación anulada"
```

#### Escenario 5: Anular una desparasitación que ya está anulada

```gherkin
Dado que la desparasitación de un paciente se encuentra en estado "Anulada"
Cuando el veterinario o técnico veterinario intenta anular nuevamente
Entonces el sistema no debe modificar los datos de la anulación original
Y debe mostrar el mensaje "La desparasitación ya se encuentra anulada"
```

#### Escenario 6: Impedir la anulación a un usuario sin permiso

```gherkin
Dado que un usuario con un rol distinto de veterinario o técnico veterinario (por ejemplo, recepcionista) se encuentra en el detalle de la desparasitación con estado "Activa"
Cuando intenta anular la desparasitación
Entonces el sistema no debe permitir la anulación
Y debe mostrar el mensaje "No tiene permisos para anular desparasitaciones"
```

---
