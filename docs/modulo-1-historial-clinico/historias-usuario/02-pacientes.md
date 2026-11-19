# Gestión de pacientes

Historias de usuario del Módulo 1 – Historial Clínico (HU-07 a HU-12).

| HU | Nombre | Actor |
| --- | --- | --- |
| HU-07 | Registrar datos del paciente | Recepcionista, Gerente, Veterinario |
| HU-08 | Actualizar datos del Paciente | Recepcionista,Gerente, Veterinario |
| HU-09 | Dar de baja a un Paciente | Gerente / Veterinario |
| HU-10 | Inactivar a un Paciente | Recepcionista,Gerente |
| HU-11 | Activar a un Paciente | Recepcionista, Gerente |
| HU-12 | Consultar datos del paciente | Recepcionista, Gerente, Veterinario, Técnico Veterinario |

## HU-07 · Registrar datos del paciente

| Actor | Requisitos vinculados |
| --- | --- |
| Recepcionista, Gerente, Veterinario | RF-05 |

**Historia**

> Como Recepcionista, Gerente o Veterinario, quiero registrar un paciente y asociarlo a un cliente existente, para facilitar su identificación y atención veterinaria.

**Criterios de aceptación**

#### Escenario 1: Registro exitoso de un paciente con datos válidos

```gherkin
Dado que el Recepcionista, Gerente o Veterinario se encuentra en el formulario de registro de pacientes y existe un cliente registrado y disponible en el sistema.
Cuando ingresa el nombre, especie, raza, género (Macho o Hembra), fecha de nacimiento (DD-MM-YYYY), peso (en kg), talla (en cm) y estado reproductivo (Esterilizado, No Esterilizado, Desconocido), opcionalmente el color, selecciona al cliente asociado y presiona “Guardar”.
Entonces el sistema debe registrar los datos del paciente con estado “Activo” y asociarlo al cliente seleccionado.
Y debe mostrar el mensaje “Paciente registrado exitosamente”.
```

#### Escenario 2: Registro con campos obligatorios incompletos

```gherkin
Dado que el Recepcionista, Gerente o Veterinario se encuentra en el formulario de registro.
Cuando deja vacío uno o más campos obligatorios y presiona “Guardar”.
Entonces el sistema debe impedir el registro.
Y debe resaltar los campos faltantes y mostrar el mensaje “Por favor, complete todos los campos obligatorios”.
```

#### Escenario 3: Registro sin campo opcional

```gherkin
Dado que el Recepcionista, Gerente o Veterinario ha completado los campos obligatorios y seleccionado un cliente existente.
Cuando deja vacío el campo “Color” y presiona “Guardar”.
Entonces el sistema debe registrar al paciente sin exigir el campo opcional.
Y debe mostrar el mensaje “Paciente registrado exitosamente”.
```

#### Escenario 4: Registro sin cliente asociado

```gherkin
Dado que el Recepcionista, Gerente o Veterinario ha completado correctamente los datos del paciente.
Cuando intenta guardar sin seleccionar un cliente existente.
Entonces el sistema debe impedir el registro.
Y debe mostrar el mensaje “Debe seleccionar un cliente registrado”.
```

#### Escenario 5: Registro con un cliente dado de baja

```gherkin
Dado que el Recepcionista, Gerente o Veterinario ha completado correctamente los datos del paciente.
Cuando intenta asociarlo a un cliente con estado “De baja”.
Entonces el sistema debe excluir al cliente de las opciones de selección o impedir el registro.
Y debe mostrar el mensaje “El cliente seleccionado no está disponible”.
```

#### Escenario 6: Registro con fecha de nacimiento inválida

```gherkin
Dado que el Recepcionista, Gerente o Veterinario se encuentra registrando un paciente.
Cuando ingresa una fecha de nacimiento inexistente, futura o con un formato diferente a DD-MM-YYYY y presiona “Guardar”.
Entonces el sistema debe rechazar la fecha e impedir el registro.
Y debe mostrar el mensaje “Fecha de nacimiento inválida”.
```

#### Escenario 7: Registro con peso o talla inválidos

```gherkin
Dado que el Recepcionista, Gerente o Veterinario se encuentra registrando un paciente.
Cuando ingresa un peso o talla igual a cero, negativo o no numérico.
Entonces el sistema debe impedir el registro.
Y debe identificar el campo inválido y mostrar el mensaje “El peso y la talla deben ser valores numéricos mayores que cero”.
```

#### Escenario 8: Generación automática del código identificador

```gherkin
Dado que el Recepcionista, Gerente o Veterinario registra un paciente con datos válidos.
Cuando presiona “Guardar”.
Entonces el sistema debe generar automáticamente un código identificador único.
Y debe asociarlo al paciente y mostrarlo en su ficha.
```

#### Escenario 9: Código identificador no editable en el registro

```gherkin
Dado que el Recepcionista, Gerente o Veterinario se encuentra en el formulario de registro de pacientes.
Cuando el sistema muestra los campos del formulario.
Entonces el sistema no debe permitir ingresar ni modificar el código identificador.
Y debe asignarlo únicamente al guardar el registro.
```

---

## HU-08 · Actualizar datos del Paciente

| Actor | Requisitos vinculados |
| --- | --- |
| Recepcionista,Gerente, Veterinario | RF-06 |

**Historia**

> Como Recepcionista, Gerente o Veterinario, quiero actualizar los datos de un paciente registrado, para mantener su información correcta y actualizada durante la atención veterinaria.

**Criterios de aceptación**

#### Escenario 1: Actualización exitosa del paciente

```gherkin
Dado que el Recepcionista, Gerente o Veterinario se encuentra en el formulario de edición de un paciente asociado a un cliente existente.
Cuando modifica uno o varios campos permitidos con valores válidos y presiona “Guardar”.
Entonces el sistema debe actualizar los datos modificados.
Y debe conservar la asociación con el cliente y mostrar el mensaje “Datos del paciente actualizados exitosamente”.
```

#### Escenario 2: Actualización con campos obligatorios vacíos

```gherkin
Dado que el Recepcionista, Gerente o Veterinario se encuentra editando un paciente registrado.
Cuando elimina el contenido de uno o más campos obligatorios y presiona “Guardar”.
Entonces el sistema debe impedir la actualización.
Y debe conservar los datos anteriores y mostrar el mensaje “Por favor, complete todos los campos obligatorios”.
```

#### Escenario 3: Actualizar peso, talla y estado reproductivo

```gherkin
Dado que el Recepcionista, Gerente o Veterinario se encuentra editando un paciente registrado.
Cuando modifica el peso en kg, la talla en cm o el estado reproductivo con valores válidos y presiona “Guardar”.
Entonces el sistema debe actualizar únicamente los datos modificados.
Y debe conservar los demás campos y mostrar el mensaje “Datos del paciente actualizados exitosamente”.
```

#### Escenario 4: Actualización dejando vacío el campo opcional

```gherkin
Dado que el Recepcionista, Gerente o Veterinario se encuentra editando un paciente registrado.
Cuando actualiza los datos obligatorios y deja vacío el campo opcional “Color” y presiona “Guardar”.
Entonces el sistema debe permitir la actualización.
Y debe conservar la asociación con el cliente existente.
```

#### Escenario 5: Actualización con fecha de nacimiento inválida

```gherkin
Dado que el Recepcionista, Gerente o Veterinario se encuentra editando un paciente con información previamente registrada.
Cuando ingresa una fecha inexistente, futura o con formato incorrecto y presiona “Guardar”.
Entonces el sistema debe rechazar la actualización y mostrar el mensaje “Fecha de nacimiento inválida”.
Y debe conservar la fecha anterior y todos los demás datos almacenados.
```

#### Escenario 6: Actualización con peso o talla inválidos

```gherkin
Dado que el Recepcionista, Gerente o Veterinario se encuentra editando un paciente con peso y talla registrados.
Cuando ingresa un peso o talla igual a cero, negativo o no numérico y presiona “Guardar”.
Entonces el sistema debe impedir la actualización e indicar el campo inválido.
Y debe conservar todos los datos previamente almacenados, sin aplicar cambios parciales.
```

#### Escenario 7: Código identificador no modificable

```gherkin
Dado que el Recepcionista, Gerente o Veterinario se encuentra editando un paciente registrado.
Cuando el sistema muestra el formulario de edición.
Entonces el sistema debe mostrar el código identificador del paciente en modo solo lectura.
Y debe conservarlo sin cambios al guardar la actualización.
```

#### Escenario 8: Paciente dado de baja no editable

```gherkin
Dado que existe un paciente con estado “De baja”.
Cuando el Recepcionista, Gerente o Veterinario accede a su ficha.
Entonces el sistema no debe mostrar la opción “Editar”.
Y debe mantener sus datos en modo solo lectura.
```

#### Escenario 9: Restricción de la edición según el rol

```gherkin
Dado que el Técnico Veterinario accede a la ficha de un paciente.
Cuando el sistema muestra las acciones disponibles.
Entonces el sistema no debe mostrar la opción “Editar”.
Y debe permitirle únicamente consultar los datos del paciente.
```

---

## HU-09 · Dar de baja a un Paciente

| Actor | Requisitos vinculados |
| --- | --- |
| Gerente / Veterinario | RF-07 |

**Historia**

> Como Gerente o Veterinario, quiero dar de baja a un paciente registrado, para retirarlo de forma definitiva de la gestión de la clínica (por ejemplo, por fallecimiento o traslado), sin eliminar físicamente sus datos y conservando su historial clínico.

**Criterios de aceptación**

#### Escenario 1: Baja exitosa de un paciente

```gherkin
Dado que el Gerente o Veterinario se encuentra en la ficha de un paciente con estado “Activo” o “Inactivo” y que no tiene citas futuras pendientes.
Cuando selecciona la opción “Dar de baja”, ingresa el motivo y confirma la acción.
Entonces el sistema debe cambiar el estado del paciente a “De baja”.
Y debe registrar la fecha, el usuario y el motivo de la baja, y mostrar el mensaje “Paciente dado de baja exitosamente”.
```

#### Escenario 2: Confirmación y motivo obligatorios

```gherkin
Dado que el Gerente o Veterinario selecciona la opción “Dar de baja” de un paciente.
Cuando el sistema muestra la ventana de confirmación.
Entonces el sistema debe advertir que la baja es definitiva y exigir un motivo.
Y si el Gerente o Veterinario cancela o no ingresa el motivo, el estado del paciente no debe cambiar.
```

#### Escenario 3: Conservar el historial clínico de un paciente dado de baja

```gherkin
Dado que existe un paciente dado de baja con historial clínico registrado.
Cuando el Veterinario o Técnico Veterinario accede a la información clínica del paciente.
Entonces el sistema debe conservar todos los registros anteriores sin eliminarlos.
Y debe mostrarlos en modo solo lectura, indicando el estado “De baja”.
```

#### Escenario 4: Baja de un paciente con citas futuras programadas

```gherkin
Dado que existe un paciente con una o más citas futuras en estado “Programada” o “Confirmada”.
Cuando el Gerente o Veterinario intenta dar de baja al paciente.
Entonces el sistema debe advertir que existen citas pendientes e impedir la baja.
Y debe indicar que las citas deben cancelarse o reprogramarse, según las reglas del módulo de Agenda de Citas, antes de completar la baja.
```

#### Escenario 5: Impedir el agendamiento y la edición de pacientes dados de baja

```gherkin
Dado que existe un paciente con estado “De baja”.
Cuando el Recepcionista, Gerente o Veterinario intenta seleccionarlo en el agendamiento de una nueva cita o intenta modificar sus datos.
Entonces el sistema debe excluirlo de los pacientes disponibles para el agendamiento.
Y debe impedir la modificación de sus datos y la reactivación desde el sistema.
```

#### Escenario 6: Restricción de la acción según el rol

```gherkin
Dado que el Recepcionista o el Técnico Veterinario accede a la ficha de un paciente.
Cuando el sistema muestra las acciones disponibles.
Entonces el sistema no debe mostrar la opción “Dar de baja”.
```

---

## HU-10 · Inactivar a un Paciente

| Actor | Requisitos vinculados |
| --- | --- |
| Recepcionista,Gerente | — |

**Historia**

> Como Recepcionista o Gerente, quiero inactivar temporalmente a un paciente registrado, para impedir que sea seleccionado en el agendamiento de nuevas citas mientras no requiera atención, conservando todos sus datos y su historial clínico.

**Criterios de aceptación**

#### Escenario 1: Inactivación exitosa de un paciente

```gherkin
Dado que el Recepcionista o Gerente se encuentra en la ficha de un paciente con estado “Activo” y que no tiene citas futuras pendientes.
Cuando selecciona la opción “Inactivar” y confirma la acción.
Entonces el sistema debe cambiar el estado del paciente de “Activo” a “Inactivo”.
Y debe conservar sus datos y su historial clínico, y mostrar el mensaje “Paciente inactivado exitosamente”.
```

#### Escenario 2: Impedir el agendamiento de citas para pacientes inactivos

```gherkin
Dado que existe un paciente con estado “Inactivo”.
Cuando el Recepcionista o Gerente intenta seleccionarlo en el formulario de agendamiento de una nueva cita.
Entonces el sistema debe excluirlo de los pacientes disponibles para el agendamiento.
Y debe impedir que sea seleccionado para la cita.
```

#### Escenario 3: Conservar el historial clínico de un paciente inactivo

```gherkin
Dado que existe un paciente inactivo con historial clínico registrado.
Cuando el Veterinario o Técnico Veterinario consulta la información clínica del paciente.
Entonces el sistema debe conservar todos los registros clínicos anteriores.
Y debe permitir su consulta al Veterinario y al Técnico Veterinario.
```

#### Escenario 4: Inactivación de un paciente con citas futuras programadas

```gherkin
Dado que existe un paciente activo con una o más citas futuras en estado “Programada” o “Confirmada”.
Cuando el Recepcionista o Gerente intenta inactivarlo.
Entonces el sistema debe advertir que existen citas pendientes e impedir la inactivación.
Y debe indicar que las citas deben cancelarse o reprogramarse antes de completar la acción.
```

---

## HU-11 · Activar a un Paciente

| Actor | Requisitos vinculados |
| --- | --- |
| Recepcionista, Gerente | — |

**Historia**

> Como Recepcionista o Gerente, quiero activar a un paciente que se encuentra inactivo, para que vuelva a estar disponible en el agendamiento de citas y en la gestión normal de la clínica.

**Criterios de aceptación**

#### Escenario 1: Activación exitosa de un paciente

```gherkin
Dado que el Recepcionista o Gerente se encuentra en la ficha de un paciente con estado “Inactivo”.
Cuando selecciona la opción “Activar” y confirma la acción.
Entonces el sistema debe cambiar el estado del paciente de “Inactivo” a “Activo”.
Y debe mostrar el mensaje “Paciente activado exitosamente”.
```

#### Escenario 2: Disponibilidad del paciente activado para el agendamiento

```gherkin
Dado que un paciente fue activado.
Cuando el Recepcionista o Gerente abre el formulario de agendamiento de una nueva cita.
Entonces el sistema debe incluir al paciente entre los pacientes disponibles.
Y debe permitir seleccionarlo para la cita.
```

#### Escenario 3: Conservación de datos e historial al activar

```gherkin
Dado que un paciente inactivo tiene datos e historial clínico registrados.
Cuando el Recepcionista o Gerente lo activa.
Entonces el sistema debe conservar sin cambios sus datos y su historial clínico.
Y debe registrar la fecha y el usuario que realizó la activación.
```

#### Escenario 4: Impedir la activación de un paciente dado de baja

```gherkin
Dado que el paciente tiene estado “De baja”.
Cuando el Recepcionista o Gerente accede a su ficha o intenta activarlo.
Entonces el sistema no debe mostrar la opción “Activar”.
Y debe mantener el estado “De baja” y su historial en modo solo lectura.
```

---

## HU-12 · Consultar datos del paciente

| Actor | Requisitos vinculados |
| --- | --- |
| Recepcionista, Gerente, Veterinario, Técnico Veterinario | RF-08 |

**Historia**

> Como Recepcionista, Gerente, Veterinario o Técnico Veterinario, quiero consultar los datos de un paciente por nombre, código identificador, primer nombre o número de cédula del cliente asociado, para localizar su ficha y consultar su información durante la gestión y la atención veterinaria.

**Criterios de aceptación**

#### Escenario 1: Consulta por nombre del paciente

```gherkin
Dado que el Recepcionista, Gerente, Veterinario o Técnico Veterinario se encuentra en el buscador y existen pacientes registrados.
Cuando ingresa el nombre completo o parcial de un paciente y presiona “Buscar”.
Entonces el sistema debe mostrar los pacientes cuyos nombres coincidan total o parcialmente con el criterio.
Y debe permitir seleccionar un paciente para consultar su ficha.
```

#### Escenario 2: Consulta por código identificador del paciente

```gherkin
Dado que existe un paciente registrado con el código identificador “PAC-0001”, generado por el sistema.
Cuando el Recepcionista, Gerente, Veterinario o Técnico Veterinario ingresa “PAC-0001” en el buscador y presiona “Buscar”.
Entonces el sistema debe mostrar el paciente cuyo código coincida exactamente con el ingresado.
Y debe permitir seleccionar el registro correspondiente para consultar su ficha.
```

#### Escenario 3: Consulta por primer nombre del cliente

```gherkin
Dado que existen clientes registrados con pacientes asociados.
Cuando el Recepcionista, Gerente, Veterinario o Técnico Veterinario ingresa al menos 3 caracteres del primer nombre de un cliente y presiona “Buscar”.
Entonces el sistema debe mostrar los pacientes asociados a clientes cuyos primeros nombres coincidan total o parcialmente con el criterio.
Y debe permitir seleccionar un paciente para consultar su ficha.
```

#### Escenario 4: Consulta por número de cédula del cliente

```gherkin
Dado que existe un cliente registrado con uno o más pacientes asociados.
Cuando el Recepcionista, Gerente, Veterinario o Técnico Veterinario ingresa entre 5 y 10 dígitos de la cédula del cliente y presiona “Buscar”.
Entonces el sistema debe mostrar los pacientes asociados a clientes cuya cédula comience con los dígitos ingresados.
Y debe permitir consultar la ficha del paciente seleccionado.
```

#### Escenario 5: Consulta ignorando espacios, tildes y mayúsculas

```gherkin
Dado que existe un paciente registrado con el nombre “José”.
Cuando el Recepcionista, Gerente, Veterinario o Técnico Veterinario ingresa “ JOSE “ o “jos” y presiona “Buscar”.
Entonces el sistema debe encontrar al paciente “José”, ignorando los espacios exteriores y las diferencias entre mayúsculas, minúsculas y tildes.
Y debe mostrar al paciente entre los resultados disponibles.
```

#### Escenario 6: Consulta sin resultados

```gherkin
Dado que el Recepcionista, Gerente, Veterinario o Técnico Veterinario se encuentra en el apartado de consulta de pacientes.
Cuando ingresa un criterio que no coincide con ningún paciente o cliente asociado y presiona “Buscar”.
Entonces el sistema no debe mostrar resultados.
Y debe presentar el mensaje “No se encontraron pacientes que coincidan con la búsqueda”.
```

#### Escenario 7: Consulta con criterio vacío

```gherkin
Dado que el Recepcionista, Gerente, Veterinario o Técnico Veterinario se encuentra en el apartado de consulta de pacientes.
Cuando presiona “Buscar” sin ingresar ningún criterio.
Entonces el sistema no debe ejecutar la consulta.
```

#### Escenario 8: Visualización del estado del paciente en los resultados

```gherkin
Dado que existen pacientes con estado “Activo”, “Inactivo” y “Dado de baja” que coinciden con el criterio.
Cuando el Recepcionista, Gerente, Veterinario o Técnico Veterinario ejecuta la consulta.
Entonces el sistema debe incluir en los resultados a los pacientes de cualquier estado.
Y debe mostrar el estado de cada paciente junto con su código, nombre, especie y cliente asociado.
```

---
