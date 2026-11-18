# Procedimientos clínicos

Historias de usuario del Módulo 1 – Historial Clínico (HU-37 a HU-42).

| HU | Nombre | Actor |
| --- | --- | --- |
| HU-37 | Registro de Tipo de Procedimiento Clínico | Administrador / Técnico Veterinario |
| HU-38 | Inactivar Tipo de Procedimiento Clínico | Administrador / Técnico Veterinario |
| HU-39 | Registrar Procedimiento Clínico | Administrador / Técnico Veterinario |
| HU-40 | Dar de Baja Procedimiento Clínico del Catálogo de Procedimientos | Administrador / Técnico Veterinario |
| HU-41 | Registro de Informe del Procedimiento Clínico | Veterinario / Técnico Veterinario |
| HU-42 | Registro de Corrección al Informe del Procedimiento Clínico | Veterinario |

## HU-37 · Registro de Tipo de Procedimiento Clínico

| Actor | Requisitos vinculados |
| --- | --- |
| Administrador / Técnico Veterinario | RF-36 |

**Historia**

> Como Administrador / Técnico Veterinario quiero registrar los Tipos de procedimientos clínicos en el sistema, para clasificar ordenadamente el Catálogo de Procedimientos disponibles para los pacientes.

**Criterios de aceptación**

#### Escenario 1: Registro exitoso de un tipo de procedimiento

```gherkin
Dado que el usuario tiene permisos de administración o técnico veterinario,
Cuando ingresa el nombre de la categoría (ej. "Cirugía", "Imagenología") y su descripción,
Entonces el sistema guarda el nuevo tipo de procedimiento con el estado "Activo" por defecto y muestra un mensaje de confirmación.
```

#### Escenario 2: Validación de campos obligatorios

```gherkin
Dado que el usuario está en el formulario de registro,
Cuando intenta guardar el formulario dejando el campo "Nombre" vacío o compuesto solo por espacios,
Entonces el sistema impide el registro y muestra un mensaje indicando que el nombre es obligatorio.
```

#### Escenario 3: Prevención de duplicados

```gherkin
Dado que ya existe un tipo de procedimiento registrado con el nombre "Eutanasia",
Cuando el usuario intenta registrar otro tipo de procedimiento con el mismo nombre (independientemente de mayúsculas/minúsculas),
Entonces el sistema notifica que la categoría ya existe y no permite la duplicidad.
```

---

## HU-38 · Inactivar Tipo de Procedimiento Clínico

| Actor | Requisitos vinculados |
| --- | --- |
| Administrador / Técnico Veterinario | RF-36 |

**Historia**

> Como Administrador / Técnico Veterinario quiero inactivar un Tipo de Procedimiento Clínico que ya no se utilice, para impedir su selección en nuevos registros de Procedimientos Clínicos garantizando la conservación del historial clínico previo.

**Criterios de aceptación**

#### Escenario 1: Inactivación exitosa de un tipo de procedimiento

```gherkin
Dado que el Administrador o Técnico Veterinario se encuentra en el módulo de gestión de Tipos de Procedimientos,
Cuando selecciona la opción "Inactivar" sobre un Tipo de Procedimiento activo y confirma la acción,
Entonces el sistema cambia su estado a "Inactivo" y muestra un mensaje de confirmación de la inactivación.
```

#### Escenario 2: Restricción en formularios de nuevos registros

```gherkin
Dado que un Tipo de Procedimiento se encuentra en estado "Inactivo",
Cuando un Administrador o Técnico Veterinario intenta crear un nuevo procedimiento en el catálogo
Entonces los Tipos de Procedimientos en estado “Inactivo” no aparecen disponibles dentro del listado desplegable de selección.
```

#### Escenario 3: Conservación del historial clínico previo

```gherkin
Dado que existen Procedimientos asociados a un Tipo de Procedimiento que fue inactivado,
Cuando se consulta la historia clínica o reportes de una mascota,
Entonces el sistema muestra intacto el Tipo de Procedimiento asignado en su momento, sin alterar ni eliminar la información registrada.
```

#### Escenario 4: Reactivación de un tipo de procedimiento inactivo

```gherkin
Dado que un Tipo de Procedimiento tiene estado "Inactivo",
Cuando el Administrador o Técnico Veterinario selecciona la opción "Activar",
Entonces el sistema actualiza su estado a "Activo" y vuelve a poner la categoría disponible para su selección en nuevos formularios de creación de Procedimientos.
```

#### Escenario 5: Prevención de inactivación para un tipo de procedimiento previamente inactivo

```gherkin
Dado que un Tipo de Procedimiento Clínico ya se encuentra en estado "Inactivo",
Cuando el Administrador o Técnico Veterinario intenta ejecutar la opción "Inactivar" sobre dicho registro,
Entonces el sistema no permite procesar la solicitud, manteniendo la opción deshabilitada o mostrando una alerta indicando que la categoría ya está inactivada.
```

---

## HU-39 · Registrar Procedimiento Clínico

| Actor | Requisitos vinculados |
| --- | --- |
| Administrador / Técnico Veterinario | RF-37 |

**Historia**

> Como Administrador / Técnico Veterinario, quiero registrar y parametrizar los procedimientos clínicos, para definir su información antes de que sean programados o ejecutados.

**Criterios de aceptación**

#### Escenario 1: Registro exitoso de un procedimiento en catálogo

```gherkin
Dado que el Administrador / Técnico Veterinario está en el formulario de creación de catálogo,
Cuando selecciona un "Tipo de Procedimiento" existente (ej. "Cirugía"), ingresa el nombre (ej. "Castración Felina"), descripción, precio base, requisitos previos (ej. "Ayuno de 8 horas"), la indicación de si requiere hospitalización ("Sí/No") y asigna la lista de insumos indispensables,
Entonces el sistema guarda el procedimiento en el catálogo y muestra un mensaje de confirmación.
```

#### Escenario 2: Validación de campos obligatorios y precio

```gherkin
Dado que el usuario está completando el formulario del catálogo,
Cuando intenta guardar omitiendo campos obligatorios (Nombre, Tipo de Procedimiento o Precio) o ingresa un precio negativo,
Entonces el sistema impide el registro y señala los campos requeridos o con datos inválidos.
```

#### Escenario 3: Vinculación de insumos indispensables

```gherkin
Dado que el usuario está configurando un procedimiento,
Cuando busca y selecciona artículos del catálogo de insumos asignando sus cantidades requeridas (ej. "2 jeringas de 3ml", "1 par de guantes"),
Entonces el sistema vincula dichos insumos como la lista predeterminada exigida para ese procedimiento.
```

#### Escenario 4: Prevención de duplicados en el catálogo

```gherkin
Dado que ya existe un procedimiento registrado con el nombre "Ecografía Abdominal" dentro del tipo "Imagenología",
Cuando el usuario intenta registrar un procedimiento con el mismo nombre y categoría,
Entonces el sistema muestra una alerta indicando que el servicio ya existe en el catálogo.
```

---

## HU-40 · Dar de Baja Procedimiento Clínico del Catálogo de Procedimientos

| Actor | Requisitos vinculados |
| --- | --- |
| Administrador / Técnico Veterinario | RF-37 |

**Historia**

> Como Administrador / Técnico Veterinario quiero deshabilitar un procedimiento clínico del catálogo, para evitar su selección en futuras programaciones o cobros garantizando la conservación del historial de atenciones y facturación previa.

**Criterios de aceptación**

#### Escenario 1: Inactivación exitosa de un servicio del catálogo

```gherkin
Dado que el Administrador / Técnico Veterinario se encuentra en la vista del Catálogo de Procedimientos,
Cuando selecciona un procedimiento activo y ejecuta la opción "Inactivar",
Entonces el sistema actualiza su estado a "Inactivo" dentro del catálogo y notifica el cambio.
```

#### Escenario 2: Bloqueo en agendas y módulo de facturación/caja

```gherkin
Dado que un procedimiento clínico del catálogo ha sido dado de baja,
Cuando el personal intenta agendar una cita o agregar el procedimiento a una orden de cobro/pre-factura,
Entonces el sistema bloquea su selección notificando que el servicio no se encuentra disponible.
```

#### Escenario 3: Trazabilidad de atenciones e historial de comprobantes

```gherkin
Dado que un procedimiento fue inactivado pero cuenta con atenciones ejecutadas y facturas emitidas anteriormente,
Cuando se consultan los reportes financieros o el expediente médico del paciente,
Entonces el sistema despliega el detalle original del servicio, precios e insumos tal como fueron registrados en la fecha de atención.
```

#### Escenario 4: Validación de agendamientos pendientes a futuro

```gherkin
Dado que un procedimiento del catálogo tiene citas médicas o intervenciones programadas a futuro,
Cuando el Administrador / Técnico Veterinario intenta dar de baja el procedimiento del catálogo,
Entonces el sistema impide la inactivación y muestra un mensaje advirtiendo que existen programaciones pendientes que deben cancelarse o reasignarse previamente.
```

---

## HU-41 · Registro de Informe del Procedimiento Clínico

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario / Técnico Veterinario | RF-38 |

**Historia**

> Como Veterinario / Técnico Veterinario, quiero redactar el informe de un procedimiento clínico ejecutado en un paciente para documentar la intervención realizada, actualizar el historial médico de la mascota y garantizar la trazabilidad de los recursos utilizados.

**Criterios de aceptación**

#### Escenario 1: Registro exitoso del informe de procedimiento

```gherkin
Dado que el usuario está registrando la finalización de un procedimiento clínico,
Cuando ingresa la hora de inicio, la hora de fin y las observaciones clínicas,
Entonces el sistema guarda el informe, lo vincula a la historia clínica de la mascota y marca el procedimiento como "Completado".
```

#### Escenario 2: Validación lógica de tiempos

```gherkin
Dado que el usuario ingresa las marcas de tiempo del procedimiento,
Cuando establece una hora de finalización anterior o igual a la hora de inicio,
Entonces el sistema muestra un mensaje de error impidiendo el guardado hasta que el rango de tiempo sea coherente.
```

#### Escenario 3: Registro de insumos utilizados

```gherkin
Dado que el usuario está redactando el informe,
Cuando selecciona insumos del inventario e indica las cantidades consumidas durante la intervención,
Entonces el sistema asocia los insumos al reporte clínico para su posterior descuento de stock o facturación.
```

#### Escenario 4: Adición de anexos y recetas opcionales

```gherkin
Dado que el procedimiento requirió archivos adjuntos o tratamiento domiciliario,
Cuando el usuario adjunta archivos clínicos (ej. imágenes, PDF de análisis) y/o redacta una receta médica opcional,
Entonces el sistema adjunta dichos elementos al registro del informe y permite su visualización o impresión.
```

#### Escenario 5: Asociación unívoca del informe al paciente y procedimiento correcto

```gherkin
Dado que el usuario abre el formulario de informe desde la atención o cita seleccionada de un paciente específico,
Cuando completa el registro y guarda el informe del procedimiento,
Entonces el sistema vincula de forma inalterable el informe a la historia clínica de dicha mascota y al procedimiento ejecutado.
```

---

## HU-42 · Registro de Corrección al Informe del Procedimiento Clínico

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario | RF-39 |

**Historia**

> Como Veterinario quiero registrar una nota de corrección a un informe de procedimiento clínico ya guardado para subsanar errores u omisiones sin alterar ni sobreescribir la información médica original, garantizando la integridad y la trazabilidad legal del expediente de la mascota.

**Criterios de aceptación**

#### Escenario 1: Adición exclusiva mediante nota de corrección no destructiva

```gherkin
Dado que un Veterinario consulta un informe de procedimiento clínico finalizado,
Cuando requiere subsanar un error o añadir información,
Entonces el sistema mantiene los datos e insumos originales en modo de solo lectura y habilita únicamente un formulario para registrar una nueva nota de corrección (motivo y detalle de la corrección) enlazada al informe inicial, registrando automáticamente la fecha, hora y el usuario que realizó la modificación.
```

#### Escenario 2: Preservación de la inmutabilidad (Trazabilidad auditada)

```gherkin
Dado que se añade una corrección a un procedimiento clínico,
Cuando el usuario o un auditor consulta el historial de la mascota,
Entonces el sistema muestra el informe original de forma intacta junto con la nota de corrección adjunta, impidiendo la sobreescritura o eliminación del registro inicial.
```

#### Escenario 3: Validación de campos obligatorios

```gherkin
Dado que el usuario está en el formulario de corrección,
Cuando intenta guardar la adenda dejando vacíos los campos "Razón de corrección" o "Descripción",
Entonces el sistema no permite guardar el cambio y muestra una alerta solicitando completar la justificación.
```

#### Escenario 4: Restricción por perfil de usuario

```gherkin
Dado que un usuario con rol de Recepcionista o Técnico sin permisos intenta modificar un procedimiento cerrado,
Cuando accede al detalle del procedimiento clínico,
Entonces el sistema no le despliega la opción para registrar correcciones.
```

---
