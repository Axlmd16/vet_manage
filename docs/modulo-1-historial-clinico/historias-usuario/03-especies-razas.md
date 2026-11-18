# Catálogo de especies y razas

Historias de usuario del Módulo 1 – Historial Clínico (HU-13 a HU-20).

| HU | Nombre | Actor |
| --- | --- | --- |
| HU-13 | Registrar Especie | Veterinario |
| HU-14 | Actualizar Especie | Veterinario |
| HU-15 | Activar e Inactivar Especie | Veterinario |
| HU-16 | Consultar Especie | Veterinario/Recepcionista/Tecnico Veterinario/Gerente |
| HU-17 | Registrar Raza | Veterinario |
| HU-18 | Actualizar Raza | Veterinario |
| HU-19 | Activar e Inactivar Raza | Veterinario |
| HU-20 | Consultar Raza | Veterinario/Recepcionista/Tecnico Veterinario/Gerente |

## HU-13 · Registrar Especie

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario | RF-13 |

**Historia**

> Como veterinario, quiero registrar nuevas especies animales en el catálogo, para mantener actualizada la clasificación de especies disponibles en la clínica veterinaria.

**Criterios de aceptación**

#### Escenario 1: Registro exitoso de una especie

```gherkin
Dado que el Veterinario accede al módulo de gestión de especies.
Cuando ingresa el nombre de la especie, la descripción opcional y selecciona la opción «Guardar».
Entonces el sistema debe registrar la especie y mostrar un mensaje de confirmación.
```

#### Escenario 2: Validación del nombre obligatorio

```gherkin
Dado que el Veterinario se encuentra en el formulario de registro de una especie.
Cuando intenta guardar el registro sin ingresar el nombre de la especie.
Entonces el sistema debe impedir el registro y mostrar un mensaje indicando que el nombre es obligatorio.
```

#### Escenario 3: Registro sin descripción

```gherkin
Dado que el Veterinario ingresa el nombre de una especie.
Cuando deja vacío el campo de descripción y guarda el registro.
Entonces el sistema debe permitir registrar la especie, ya que la descripción es opcional.
```

#### Escenario 4: Cancelación del registro

```gherkin
Dado que el Veterinario ha ingresado información en el formulario de registro.
Cuando selecciona la opción «Cancelar».
Entonces el sistema debe cancelar la operación sin guardar la especie.
```

---

## HU-14 · Actualizar Especie

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario | RF-14 |

**Historia**

> Como Veterinario, quiero actualizar la información de una especie registrada, para mantener actualizados sus datos generales dentro del catálogo de especies.

**Criterios de aceptación**

#### Escenario 1: Actualización exitosa de una especie

```gherkin
Dado que el Veterinario accede a la información de una especie registrada.
Cuando modifica el nombre o la descripción y selecciona la opción «Guardar».
Entonces el sistema debe actualizar la información de la especie y mostrar un mensaje de confirmación.
```

#### Escenario 2: Validación del nombre obligatorio

```gherkin
Dado que el Veterinario modifica la información de una especie.
Cuando elimina el nombre e intenta guardar los cambios.
Entonces el sistema debe impedir la actualización y mostrar un mensaje indicando que el nombre es obligatorio.
```

#### Escenario 3: Actualización sin descripción

```gherkin
Dado que el Veterinario modifica la información de una especie registrada.
Cuando deja vacío el campo de descripción y guarda los cambios.
Entonces el sistema debe permitir la actualización, ya que la descripción es opcional.
```

#### Escenario 4: Cancelación de la actualización

```gherkin
Dado que el Veterinario ha modificado la información de una especie.
Cuando selecciona la opción «Cancelar».
Entonces el sistema debe descartar los cambios y conservar la información registrada anteriormente.
```

---

## HU-15 · Activar e Inactivar Especie

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario | RF-15, RF-16 |

**Historia**

> Como veterinario, quiero activar o inactivar una especie registrada, para controlar su disponibilidad en el catálogo según las necesidades de la clínica veterinaria.

**Criterios de aceptación**

#### Escenario 1: Inactivación exitosa de una especie

```gherkin
Dado que el Veterinario accede a una especie registrada con estado «Activa».
Cuando selecciona la opción «Inactivar» y confirma la operación.
Entonces el sistema debe cambiar el estado de la especie a «Inactiva» y mostrar un mensaje de confirmación.
```

#### Escenario 2: Activación exitosa de una especie

```gherkin
Dado que el Veterinario accede a una especie con estado «Inactiva».
Cuando selecciona la opción «Activar» y confirma la operación.
Entonces el sistema debe cambiar el estado de la especie a «Activa» y mostrar un mensaje de confirmación.
```

#### Escenario 3: Restricción de las acciones según el estado de la especie

```gherkin
Dado que el Veterinario accede a una especie registrada.
Cuando el sistema muestra las acciones disponibles según su estado.
Entonces el sistema debe mostrar únicamente la opción «Inactivar» para las especies «Activas» y la opción «Activar» para las especies «Inactivas».
```

#### Escenario 4: Restablecimiento de la disponibilidad de una especie

```gherkin
Dado que una especie ha sido activada y tiene el estado «Activa».
Cuando el Veterinario, Técnico Veterinario o Recepcionista accede al catálogo para seleccionar una especie.
Entonces el sistema debe permitir que la especie esté disponible para su selección.
```

#### Escenario 5: Cancelación de la operación

```gherkin
Dado que el Veterinario inicia el proceso de activación o inactivación de una especie.
Cuando selecciona la opción «Cancelar» en la confirmación.
Entonces el sistema debe cancelar la operación y mantener el estado anterior de la especie.
```

---

## HU-16 · Consultar Especie

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario/Recepcionista/Tecnico Veterinario/Gerente | RF-17 |

**Historia**

> Como Veterinario, Recepcionista, Técnico Veterinario o Gerente, quiero consultar las especies registradas mediante una búsqueda por nombre, para localizar fácilmente la información de las especies dentro del sistema.

**Criterios de aceptación**

#### Escenario 1: Consulta exitosa de una especie por nombre

```gherkin
Dado que el Veterinario, Recepcionista, Técnico Veterinario o Gerente accede al módulo de gestión de especies.
Cuando ingresa el nombre de una especie en el campo de búsqueda.
Entonces el sistema debe mostrar las especies que coincidan con el nombre ingresado.
```

#### Escenario 2: Consulta sin resultados

```gherkin
Dado que el Veterinario, Recepcionista, Técnico Veterinario o Gerente realiza una búsqueda de especies por nombre.
Cuando no existen especies que coincidan con el criterio ingresado.
Entonces el sistema debe mostrar un mensaje indicando que no se encontraron resultados.
```

#### Escenario 3: Visualización de la información de una especie

```gherkin
Dado que el Veterinario, Recepcionista, Técnico Veterinario o Gerente realiza una búsqueda y el sistema muestra los resultados.
Cuando selecciona una especie de los resultados.
Entonces el sistema debe mostrar su información registrada, incluyendo el nombre, la descripción y el estado.
```

---

## HU-17 · Registrar Raza

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario | RF-17 |

**Historia**

> Como Veterinario, quiero registrar nuevas razas asociándolas a una especie activa previamente registrada, para mantener organizada la clasificación de las razas dentro del catálogo de la clínica veterinaria.

**Criterios de aceptación**

#### Escenario 1: Registro exitoso de una raza

```gherkin
Dado que el Veterinario accede al módulo de gestión de razas y dispone de una especie activa registrada.
Cuando ingresa el nombre de la raza, selecciona la especie a la que pertenece, completa opcionalmente la descripción y guarda el registro.
Entonces el sistema debe registrar la raza asociada a la especie seleccionada y mostrar un mensaje de confirmación.
```

#### Escenario 2: Validación del nombre obligatorio

```gherkin
Dado que el Veterinario se encuentra en el formulario de registro de una raza.
Cuando intenta guardar el registro sin ingresar el nombre de la raza.
Entonces el sistema debe impedir el registro y mostrar un mensaje indicando que el nombre es obligatorio.
```

#### Escenario 3: Asociación obligatoria con una especie

```gherkin
Dado que el Veterinario se encuentra en el formulario de registro de una raza.
Cuando intenta guardar el registro sin seleccionar una especie.
Entonces el sistema debe impedir el registro e indicar que debe asociarse a una especie.
```

#### Escenario 4: Selección de una especie activa

```gherkin
Dado que el Veterinario accede al formulario de registro de una raza.
Cuando consulta las especies disponibles para establecer la asociación.
Entonces el sistema debe permitir seleccionar únicamente especies con estado «Activa».
```

#### Escenario 5: Registro sin descripción

```gherkin
Dado que el Veterinario ingresa el nombre de la raza y selecciona una especie activa.
Cuando deja vacío el campo de descripción y guarda el registro.
Entonces el sistema debe permitir registrar la raza, ya que la descripción es opcional.
```

#### Escenario 6: Cancelación del registro

```gherkin
Dado que el Veterinario ha ingresado información en el formulario de registro de una raza.
Cuando seleccione la opción «Cancelar».
Entonces el sistema debe cancelar la operación y no guardar la información ingresada.
```

---

## HU-18 · Actualizar Raza

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario | RF-19 |

**Historia**

> Como Veterinario, quiero actualizar la información de una raza registrada, incluyendo su nombre, especie asociada y descripción, para mantener actualizados los datos del catálogo sin alterar las historias clínicas de los pacientes asociados.

**Criterios de aceptación**

#### Escenario 1: Actualización exitosa de una raza

```gherkin
Dado que el Veterinario accede a la información de una raza previamente registrada.
Cuando modifica el nombre, la especie asociada o la descripción y guarda los cambios.
Entonces el sistema debe actualizar la información de la raza y mostrar un mensaje de confirmación.
```

#### Escenario 2: Validación del nombre obligatorio

```gherkin
Dado que el Veterinario se encuentra en el formulario de actualización de una raza.
Cuando elimina el nombre e intenta guardar los cambios.
Entonces el sistema debe impedir la actualización y mostrar un mensaje indicando que el nombre es obligatorio.
```

#### Escenario 3: Validación de la especie asociada

```gherkin
Dado que el Veterinario se encuentra actualizando una raza registrada.
Cuando intenta guardar los cambios sin seleccionar una especie asociada.
Entonces el sistema debe impedir la actualización e indicar que debe seleccionar una especie.
```

#### Escenario 4: Actualización sin descripción

```gherkin
Dado que el Veterinario modifica la información de una raza y mantiene seleccionado su nombre y especie asociada.
Cuando deja vacío el campo de descripción y guarda los cambios.
Entonces el sistema debe permitir actualizar la raza, ya que la descripción es opcional.
```

#### Escenario 5: Conservación de las historias clínicas asociadas

```gherkin
Dado que una raza registrada se encuentra asociada a pacientes con historias clínicas.
Cuando el Veterinario actualiza la información de dicha raza.
Entonces el sistema debe conservar las historias clínicas de los pacientes asociados sin alterarlas.
```

#### Escenario 6: Cancelación de la actualización

```gherkin
Dado que el Veterinario ha modificado la información de una raza.
Cuando selecciona la opción «Cancelar».
Entonces el sistema debe descartar los cambios y conservar la información registrada anteriormente.
```

---

## HU-19 · Activar e Inactivar Raza

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario | RF-20, RF-21 |

**Historia**

> Como Veterinario, quiero activar o inactivar una raza registrada, para controlar su disponibilidad en el catálogo según las necesidades de la clínica veterinaria,

**Criterios de aceptación**

#### Escenario 1: Inactivación exitosa de una raza

```gherkin
Dado que el Veterinario accede a una raza registrada con estado «Activa».
Cuando selecciona la opción «Inactivar» y confirma la operación.
Entonces el sistema debe cambiar su estado a «Inactiva» y mostrar un mensaje de confirmación.
```

#### Escenario 2: Activación exitosa de una raza

```gherkin
Dado que el Veterinario accede a una raza registrada con estado «Inactiva».
Cuando selecciona la opción «Activar» y confirma la operación.
Entonces el sistema debe cambiar su estado a «Activa» y mostrar un mensaje de confirmación.
```

#### Escenario 3: Restricción de selección de una raza inactiva

```gherkin
Dado que una raza ha sido inactivada y tiene el estado «Inactiva».
Cuando el Veterinario, Recepcionista o Técnico Veterinario intenta seleccionarla en el sistema.
Entonces el sistema debe impedir su selección.
```

#### Escenario 4: Restablecimiento de la disponibilidad de una raza

```gherkin
Dado que una raza ha sido activada y tiene el estado «Activa».
Cuando el Veterinario, Recepcionista o Técnico Veterinario intenta seleccionarla en el sistema.
Entonces el sistema debe permitir su selección.
```

#### Escenario 5: Cancelación de la operación

```gherkin
Dado que el Veterinario ha iniciado el proceso de activación o inactivación de una raza.
Cuando selecciona la opción «Cancelar» en la confirmación de la operación.
Entonces el sistema debe cancelar la operación y conservar el estado anterior de la raza.
```

#### Escenario 6: Conservación de la información de la raza

```gherkin
Dado que una raza ha sido activada o inactivada.
Cuando el Veterinario consulta su información en el catálogo.
Entonces el sistema debe conservar los datos registrados de la raza sin eliminarlos ni modificarlos.
```

---

## HU-20 · Consultar Raza

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario/Recepcionista/Tecnico Veterinario/Gerente | RF-22 |

**Historia**

> Como Veterinario, Recepcionista, Técnico Veterinario o Gerente, quiero consultar las razas registradas mediante una búsqueda por nombre o un filtro por especie, para localizar fácilmente la información de las razas dentro del sistema.

**Criterios de aceptación**

#### Escenario 1: Consulta exitosa de una raza por nombre

```gherkin
Dado que el Veterinario, Recepcionista, Técnico Veterinario o Gerente accede al módulo de gestión de razas.
Cuando ingresa el nombre de una raza en el campo de búsqueda.
Entonces el sistema debe mostrar las razas que coincidan con el nombre ingresado.
```

#### Escenario 2: Filtrado de razas por especie

```gherkin
Dado que el Veterinario, Recepcionista, Técnico Veterinario o Gerente accede al módulo de gestión de razas.
Cuando selecciona una especie en el filtro correspondiente.
Entonces el sistema debe mostrar únicamente las razas asociadas a la especie seleccionada.
```

#### Escenario 3: Consulta sin resultados

```gherkin
Dado que el Veterinario, Recepcionista, Técnico Veterinario o Gerente realiza una búsqueda por nombre o aplica un filtro por especie.
Cuando no existen razas que coincidan con el criterio de búsqueda o filtrado.
Entonces el sistema debe mostrar un mensaje indicando que no se encontraron resultados.
```

#### Escenario 4: Visualización de la información de una raza

```gherkin
Dado que el Veterinario, Recepcionista, Técnico Veterinario o Gerente realiza una búsqueda o filtrado y el sistema muestra los resultados.
Cuando selecciona una raza de los resultados.
Entonces el sistema debe mostrar su información registrada, incluyendo el nombre, la especie asociada, la descripción y el estado.
```

---
