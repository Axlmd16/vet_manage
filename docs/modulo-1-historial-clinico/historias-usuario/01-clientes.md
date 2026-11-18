# Gestión de clientes

Historias de usuario del Módulo 1 – Historial Clínico (HU-01 a HU-06).

| HU | Nombre | Actor |
| --- | --- | --- |
| HU-01 | Registrar datos del cliente | Recepcionista , Veterinario, Gerente |
| HU-02 | Actualizar los datos del cliente | Recepcionista, Gerente, Veterinario |
| HU-03 | Dar de baja un cliente | Gerente , Veterinario |
| HU-04 | Inactivar un Cliente | Recepcionista , Gerente |
| HU-05 | Activar un Cliente | Recepcionista , Gerente |
| HU-06 | Consultar clientes | Recepcionista , Gerente Veterinario |

## HU-01 · Registrar datos del cliente

| Actor | Requisitos vinculados |
| --- | --- |
| Recepcionista , Veterinario, Gerente | RF-01 |

**Historia**

> Como Recepcionista, Veterinario o Gerente quiero registrar un cliente para identificarlo sin duplicados y poder asociar sus mascotas.

**Criterios de aceptación**

#### Escenario 1: Registro exitoso de un cliente con datos válidos

```gherkin
Dado que el Recepcionista, Veterinario o Gerente se encuentra en el formulario de registro de cliente
Cuando ingresa los campos obligatorios (cédula de 10 dígitos numéricos, primer nombre, primer apellido, teléfono de 10 dígitos numéricos y correo con formato (usuario@dominio.com) y la dirección opcional, y presiona el botón "Guardar"
Entonces el sistema debe guardar el cliente en la base de datos con estado "Activo"
Y debe mostrar el mensaje "Cliente registrado exitosamente".
```

#### Escenario 2: Omitir campos obligatorios

```gherkin
Dado que el Recepcionista, Veterinario o Gerente se encuentra en el formulario de registro de cliente
Cuando deja en blanco uno o más campos obligatorios(ej. contacto), se presiona el botón "Guardar"
Entonces el sistema debe detener el guardado del registro
Y debe resaltar los campos requeridos vacíos y mostrar el mensaje "Por favor, complete todos los campos obligatorios" .
```

#### Escenario 3: Registrar una identificación existente

```gherkin
Dado que existe un cliente registrado en el sistema con número de cédula
Cuando el Recepcionista, Gerente ingresa el mismo número de cédula junto a los demás datos requeridos, presiona el botón "Guardar"
Entonces el sistema debe rechazar la transacción
Y debe mostrar el mensaje "Número de cédula ya registrado".
```

#### Escenario 4: Validar número de cédula inválido

```gherkin
Dado que el Recepcionista se encuentra en el formulario de registro de cliente
Cuando ingresa un número de cédula que no cumple con el formato exacto de 10 dígitos numéricos (ej. alfanumérico o longitud diferente) y presiona el botón "Guardar"
Entonces el sistema debe rechazar la transacción
Y debe resaltar el campo cédula y mostrar el mensaje "Número de cédula no válido" .
```

#### Escenario 5: Validar formato incorrecto en correo electrónico y teléfono de contacto

```gherkin
Dado que el Recepcionista se encuentra en el formulario de registro de cliente
Cuando ingresa un correo electrónico sin formato válido((usuario@dominio.com) ) o un teléfono con caracteres alfabéticos, si no contiene exactamente 10 dígitos, o con prefijo inválido presiona el botón "Guardar"
Entonces el sistema debe bloquear el guardado del registro
Y debe resaltar los campos erróneos y mostrar el mensaje "Por favor, ingrese un correo y número de teléfono válido" .
```

---

## HU-02 · Actualizar los datos del cliente

| Actor | Requisitos vinculados |
| --- | --- |
| Recepcionista, Gerente, Veterinario | RF-02 |

**Historia**

> Como Recepcionistaio, quiero actualizar los datos de un cliente registrado, para mantener su información actualizada en el sistema.

**Criterios de aceptación**

#### Escenario 1: Actualización exitosa de los datos del cliente

```gherkin
Dado que el Recepcionista se encuentra en el formulario de edición del cliente
Cuando modifica uno o más campos editables (primer nombre, primer apellido, teléfono de 10 dígitos, correo válido (usuario@dominio.com) o dirección) y presiona el botón "Guardar Cambios"
Entonces el sistema debe actualizar los datos del cliente en la base de datos
Y debe mostrar el mensaje "Datos actualizados correctamente".
```

#### Escenario 2: Inmutabilidad del número de cédula durante la edición

```gherkin
Dado que el Recepcionista se encuentra en el formulario de edición de un cliente registrado
Cuando visualiza el campo correspondiente al número de cédula
Entonces el sistema debe mantener el campo de cédula deshabilitado en modo lectura
Y no debe permitir modificar el número de cédula para preservar la identificación única del cliente.
```

#### Escenario 3: Omitir campos obligatorios durante la edición

```gherkin
Dado que el Recepcionista se encuentra en el formulario de edición de un cliente registrado
Cuando borra o deja en blanco uno o más campos obligatorios (primer nombre, primer apellido, teléfono o correo valido (usuario@dominio.com) ), se presiona el botón "Guardar Cambios"
Entonces el sistema debe detener la actualización del registro
Y debe resaltar los campos vacíos y mostrar el mensaje "Por favor, complete todos los campos obligatorios".
```

---

## HU-03 · Dar de baja un cliente

| Actor | Requisitos vinculados |
| --- | --- |
| Gerente , Veterinario | RF-03 |

**Historia**

> Como Gerente o Veterinario, quiero dar de baja a un cliente registrado, para retirarlo de forma definitiva de la gestión de la clínica conservando de forma íntegra todas las facturas, atenciones médicas e historial previo vinculados a sus mascotas para consulta histórica

**Criterios de aceptación**

#### Escenario 1: Dar de baja a un cliente

```gherkin
Dado que el Gerente o Veterinario se encuentra en la ficha de un cliente con estado «Activo» o «Inactivo» y este no tiene citas futuras pendientes.
Cuando selecciona la opción «Dar de baja», ingresa el motivo y confirma la acción.
Entonces el sistema debe cambiar el estado del cliente a «De baja» sin eliminar su registro.
Y debe almacenar la fecha, el usuario responsable y el motivo de la baja, con un mensaje «Cliente dado de baja correctamente».
```

#### Escenario 2: Impedir la baja de un cliente con citas futuras pendientes

```gherkin
Dado que el cliente tiene una o más citas futuras en estado “Programada” o “Confirmada”
Cuando el Gerente o Veterinario intenta darlo de baja
Entonces el sistema debe advertir que existen citas pendientes e impedir la baja
Y debe indicar que las citas deben cancelarse o reprogramarse antes de completar la acción.
```

#### Escenario 3: Consultar el historial de un cliente dado de baja

```gherkin
Dado que existe un cliente en estado “Dado de baja” con facturas, atenciones médicas e historial registrados
Cuando el Gerente o Veterinario consulta su información
Entonces el sistema debe mostrar todos los registros anteriores en modo solo lectura.
```

#### Escenario 4: Validar la confirmación y el motivo de la baja

```gherkin
Dado que el Gerente o Veterinario selecciona la opción «Dar de baja» para un cliente.
Cuando intenta confirmar la operación sin ingresar el motivo de la baja.
Entonces el sistema debe solicitar el ingreso obligatorio del motivo.
Y no debe ejecutar la baja hasta que se complete este campo y se confirme la operación.
```

#### Escenario 5: Impedir el uso de un cliente en nuevas transacciones

```gherkin
Dado que un cliente se encuentra en estado “De baja ”
Cuando la Recepcionista, Veterinario, Gerente intenta seleccionar dicho cliente para registrar una nueva mascota, agendar una cita, emitir una factura o iniciar una nueva atención médica
Entonces el sistema debe bloquear la selección del cliente para estas operaciones
Y debe indicar que el cliente está dado de baja .
```

#### Escenario 6: Cancelar la baja del cliente

```gherkin
Dado que el Gerente o Veterinario selecciona la opción «Dar de baja» y el sistema muestra el cuadro de confirmación.
Cuando cancela la operación.
Entonces el sistema no debe modificar el estado ni la información del cliente.
Y el cliente debe conservar su estado anterior («Activo» o «Inactivo»).
```

#### Escenario 7: Restricción de la acción según el rol

```gherkin
Dado que el Recepcionista o el Técnico Veterinario accede a la ficha de un cliente.
Cuando el sistema muestra las acciones disponibles.
Entonces el sistema no debe mostrar la opción «Dar de baja».
```

---

## HU-04 · Inactivar un Cliente

| Actor | Requisitos vinculados |
| --- | --- |
| Recepcionista , Gerente | RF-04 |

**Historia**

> Como Recepcionista o Gerente, quiero inactivar temporalmente a un cliente registrado, para impedir que sea seleccionado en nuevas transacciones, conservando su información y los historiales clínicos de sus mascotas .

**Criterios de aceptación**

#### Escenario 1: Inactivación exitosa de un cliente

```gherkin
Dado que el Recepcionista o Gerente accede a la ficha de un cliente con estado «Activo».
Cuando selecciona la opción «Inactivar» y confirma la operación.
Entonces el sistema debe cambiar el estado del cliente a «Inactivo» y mostrar un mensaje de confirmación.
```

#### Escenario 2: Restricción del uso de un cliente inactivo en nuevas transacciones

```gherkin
Dado que un cliente tiene el estado «Inactivo».
Cuando el usuario intenta seleccionarlo para realizar un nuevo agendamiento de cita u otra transacción de la clínica.
Entonces el sistema debe impedir su selección y mostrar un mensaje indicando que el cliente se encuentra inactivo.
```

#### Escenario 3: Conservación de la información del cliente

```gherkin
Dado que un cliente ha sido inactivado.
Cuando el usuario autorizado consulta su ficha.
Entonces el sistema debe conservar y permitir consultar su información y los historiales clínicos asociados, sin eliminar los registros existentes.
```

#### Escenario 4: Cancelación de la inactivación

```gherkin
Dado que el Recepcionista o Gerente inicia el proceso de inactivación de un cliente con estado «Activo».
Cuando selecciona la opción «Cancelar» en la confirmación.
Entonces el sistema debe cancelar la operación y mantener el estado del cliente como «Activo».
```

---

## HU-05 · Activar un Cliente

| Actor | Requisitos vinculados |
| --- | --- |
| Recepcionista , Gerente | RF-05 |

**Historia**

> Como Recepcionista o Gerente, quiero activar temporalmente a un cliente registrado, para impedir que sea seleccionado en el agendamiento de nuevas citas mientras no requiera atención, conservando todos sus datos y su historial clínico.

**Criterios de aceptación**

#### Escenario 1: Activación exitosa de un cliente

```gherkin
Dado que el Recepcionista o Gerente accede a la ficha de un cliente con estado «Inactivo».
Cuando selecciona la opción «Activar» y confirma la operación.
Entonces el sistema debe cambiar el estado del cliente a «Activo», registrar la fecha y el usuario responsable de la activación, y mostrar un mensaje de confirmación.
```

#### Escenario 2: Restablecimiento de la disponibilidad del cliente

```gherkin
Dado que un cliente ha sido activado y tiene el estado «Activo».
Cuando el Recepcionista o Gerente intenta seleccionarlo para realizar un nuevo agendamiento de cita u otra transacción de la clínica.
Entonces el sistema debe permitir su selección y continuar con el proceso correspondiente.
```

#### Escenario 3: Conservación de la información del cliente

```gherkin
Dado que un cliente ha sido activado.
Cuando el Recepcionista , Gerente o Veterinario consulta sus datos .
Entonces el sistema debe conservar y permitir consultar su información y los historiales clínicos asociados, sin alterar los registros existentes.
```

#### Escenario 4: Cancelación de la activación

```gherkin
Dado que el Recepcionista o Gerente inicia el proceso de activación de un cliente con estado «Inactivo».
Cuando selecciona la opción «Cancelar» en la confirmación.
Entonces el sistema debe cancelar la operación y mantener el estado del cliente como «Inactivo».
```

#### Escenario 5: Impedir la activación de un cliente dado de baja

```gherkin
Dado que el Recepcionista o Gerente accede a la ficha de un cliente con estado «De baja».
Cuando el sistema muestra las acciones disponibles.
Entonces el sistema no debe mostrar la opción «Activar», impidiendo que el cliente vuelva a estar disponible en la gestión operativa de la clínica.
```

---

## HU-06 · Consultar clientes

| Actor | Requisitos vinculados |
| --- | --- |
| Recepcionista , Gerente Veterinario | RF-06 |

**Historia**

> Como Recepcionista, quiero consultar clientes registrados por su número de cédula, primer nombre o primer apellido, para vincular o seleccionar a sus mascotas de forma inmediata en los flujos de recepción, agendamiento o consulta

**Criterios de aceptación**

#### Escenario 1: Búsqueda exacta por número de cédula

```gherkin
Dado que el Recepcionista, Gerente se encuentra en el módulo de búsqueda de clientes
Cuando ingresa el número de cédula y presiona el botón "Buscar"
Entonces el sistema debe desplegar en un tiempo máximo de respuesta de 3 segundos únicamente la ficha del cliente coincidente
Y debe mostrar el listado de sus mascotas vinculadas para su selección inmediata.
```

#### Escenario 2: Búsqueda por coincidencia de primer nombre o primer apellido

```gherkin
Dado que el Recepcionista se encuentra en el módulo de búsqueda de clientes
Cuando ingresa al menos 2 caracteres del primer nombre o del primer apellido y presiona “Buscar”
Entonces el sistema debe mostrar, la lista de todos los clientes cuyo nombre o apellido contenga el texto ingresado, sin distinguir mayúsculas ni tildes
Y debe permitir visualizar las mascotas vinculadas al cliente seleccionado.
```

#### Escenario 3: Búsqueda sin resultados en el sistema

```gherkin
Dado que el Recepcionista se encuentra en el módulo de búsqueda de clientes
Cuando ingresa un parámetro de búsqueda que no existe en la base de datos y presiona "Buscar"
Entonces el sistema debe mostrar el mensaje "No se encontraron clientes registrados con el criterio ingresado"
Y debe ofrecer la opción "Registrar nuevo cliente".
```

---
