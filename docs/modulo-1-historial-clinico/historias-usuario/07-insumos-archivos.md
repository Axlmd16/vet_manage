# Insumos utilizados y archivos clínicos

Historias de usuario del Módulo 1 – Historial Clínico (HU-43 a HU-50).

| HU | Nombre | Actor |
| --- | --- | --- |
| HU-43 | Registrar insumos utilizados | Veterinario / Técnico Veterinario |
| HU-44 | Retirar insumo del listado | Veterinario / Técnico Veterinario |
| HU-45 | Adjuntar archivo clínico | Veterinario / Técnico Veterinario |
| HU-46 | Consultar listado de archivos clínicos | Veterinario / Técnico Veterinario |
| HU-35 | Visualizar archivo PDF o imagen | Veterinario / Técnico Veterinario |
| HU-47 | Visualizar imágenes DICOM | Veterinario / Técnico Veterinario |
| HU-48 | Descargar archivo clínico | Veterinario / Técnico Veterinario |
| HU-49 | Actualizar información del archivo | Veterinario / Técnico Veterinario |
| HU-50 | Retirar archivo clínico | Veterinario / Técnico Veterinario |

## HU-43 · Registrar insumos utilizados

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario / Técnico Veterinario | RF-40 |

**Historia**

> Como Veterinario o Técnico Veterinario, quiero agregar al listado de insumos de una atención clínica o procedimiento los insumos disponibles en la Farmacia Local, con su cantidad, para dejar constancia de los materiales usados en cada paciente.

**Criterios de aceptación**

#### Escenario 1: Agregar varios insumos a una atención clínica

```gherkin
Dado que el Veterinario tiene una atención clínica en estado "En Curso" y los insumos "Jeringa 3 ml" y "Gasa estéril" constan en el listado de insumos disponibles de la Farmacia Local
Cuando agrega "Jeringa 3 ml" con cantidad 2 y "Gasa estéril" con cantidad 4, y presiona "Guardar"
Entonces el sistema debe registrar ambos insumos en el listado de insumos utilizados de esa atención
Y debe mostrarlos con su nombre, cantidad y descripción
```

#### Escenario 2: Agregar insumos a un procedimiento clínico

```gherkin
Dado que el Técnico Veterinario participa en el procedimiento "Sutura de herida" del paciente "Luna" en estado "En Curso" y el insumo "Sutura nylon 3-0" consta en el listado de insumos disponibles
Cuando agrega "Sutura nylon 3-0" con cantidad 1 y presiona "Guardar"
Entonces el sistema debe registrar el insumo en el listado de insumos utilizados de ese procedimiento
Y debe mostrarlo con su nombre, cantidad y descripción
```

#### Escenario 3: Insumo que no está disponible en farmacia

```gherkin
Dado que el insumo "Catéter 22G" no consta en el listado de insumos disponibles de la Farmacia Local
Cuando el Veterinario lo busca para agregarlo al listado de insumos utilizados
Entonces el sistema no debe permitir seleccionarlo
Y debe mostrar el mensaje "El insumo no se encuentra disponible en la farmacia"
```

#### Escenario 4: Cantidad no válida

```gherkin
Dado que el Veterinario está agregando el insumo "Jeringa 3 ml" al listado
Cuando ingresa la cantidad 0 o un valor negativo y presiona "Agregar"
Entonces el sistema no debe agregar el insumo
Y debe resaltar el campo cantidad con el mensaje "Ingrese una cantidad mayor a cero"
```

---

## HU-44 · Retirar insumo del listado

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario / Técnico Veterinario | RF-41 |

**Historia**

> Como Veterinario o Técnico Veterinario, quiero retirar un insumo del listado mientras la atención o procedimiento no haya finalizado, para corregir un insumo que agregué por error.

**Criterios de aceptación**

#### Escenario 1: Retirar insumo de una atención en curso

```gherkin
Dado que la atención clínica está en estado "En Curso" y su listado contiene "Jeringa 3 ml" y "Gasa estéril"
Cuando el Veterinario selecciona "Gasa estéril" y presiona "Retirar"
Entonces el sistema debe quitar "Gasa estéril" del listado de insumos utilizados
Y debe conservar "Jeringa 3 ml" sin cambios
```

#### Escenario 2: Retirar insumo de un procedimiento en curso

```gherkin
Dado que el procedimiento "Sutura de herida" del paciente "Luna" está en estado "En Curso" y su listado contiene "Sutura nylon 3-0" y "Guantes estériles"
Cuando el Técnico Veterinario selecciona "Guantes estériles" y presiona "Retirar"
Entonces el sistema debe quitar "Guantes estériles" del listado de ese procedimiento
Y debe conservar "Sutura nylon 3-0" sin cambios
```

#### Escenario 3: Retirar insumo de una atención finalizada

```gherkin
Dado que la atención clínica está en estado "Finalizada"
Cuando el Veterinario intenta retirar un insumo de su listado
Entonces el sistema debe bloquear la acción
Y debe mostrar el mensaje "No se pueden modificar los insumos de una atención finalizada"
```

#### Escenario 4: El retiro no afecta otros registros

```gherkin
Dado que el insumo "Jeringa 3 ml" está en el listado de dos atenciones distintas del mismo paciente
Cuando el Veterinario lo retira del listado de la atención en curso
Entonces el sistema debe mantener "Jeringa 3 ml" en el listado de la otra atención y en el catálogo de la farmacia
```

---

## HU-45 · Adjuntar archivo clínico

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario / Técnico Veterinario | RF-42, RF-43, RF-44 |

**Historia**

> Como Veterinario o Técnico Veterinario, quiero adjuntar un archivo clínico (PDF, JPG, PNG o DICOM de hasta 50 MB) a una atención clínica o procedimiento, con un nombre y una descripción, para que quede disponible en la historia clínica del paciente.

**Criterios de aceptación**

#### Escenario 1: Carga exitosa y asociación automática

```gherkin
Dado que el Veterinario está registrando una atención clínica del paciente "Luna"
Cuando selecciona el archivo "hemograma.pdf" de 2 MB, ingresa el nombre "Hemograma completo" y la descripción "Control prequirúrgico", y presiona "Cargar"
Entonces el sistema debe guardar el archivo con la fecha de carga y el usuario responsable registrados automáticamente
Y debe asociarlo a esa atención y a la historia clínica de "Luna"
```

#### Escenario 2: Carga realizada por el Técnico Veterinario en un procedimiento

```gherkin
Dado que el Técnico Veterinario está registrando el procedimiento "Radiografía de cadera" del paciente "Rocky"
Cuando selecciona el archivo "cadera.dcm" de 30 MB, ingresa el nombre "Rx cadera" y presiona "Cargar"
Entonces el sistema debe guardar el archivo con la fecha de carga y el Técnico Veterinario como responsable
Y debe asociarlo a ese procedimiento y a la historia clínica de "Rocky"
```

#### Escenario 3: Archivo en el tamaño máximo permitido

```gherkin
Dado que el Veterinario está adjuntando un archivo a una atención clínica
Cuando selecciona el archivo "ecografia.pdf" de exactamente 50 MB, ingresa el nombre "Ecografía abdominal" y presiona "Cargar"
Entonces el sistema debe aceptar y guardar el archivo
```

#### Escenario 4: Archivo que supera el tamaño máximo

```gherkin
Dado que el Veterinario está adjuntando un archivo a un procedimiento clínico
Cuando selecciona el archivo "tomografia.dcm" de 65 MB y presiona "Cargar"
Entonces el sistema debe rechazar la carga
Y debe mostrar el mensaje "El archivo supera el tamaño máximo de 50 MB"
```

#### Escenario 5: Formato no permitido

```gherkin
Dado que el Veterinario está adjuntando un archivo a una atención clínica
Cuando selecciona el archivo "informe.docx" y presiona "Cargar"
Entonces el sistema debe rechazar la carga
Y debe mostrar el mensaje "Formato no permitido. Use PDF, JPG, PNG o DICOM"
```

#### Escenario 6: Archivo con extensión cambiada

```gherkin
Dado que el archivo "informe.pdf" es en realidad un documento de Word al que se le cambió la extensión
Cuando el Veterinario lo selecciona, ingresa un nombre y presiona "Cargar"
Entonces el sistema debe rechazar la carga
Y debe mostrar el mensaje "El contenido del archivo no corresponde a un formato permitido (PDF, JPG, PNG o DICOM)"
```

#### Escenario 7: Nombre del archivo vacío

```gherkin
Dado que el Veterinario seleccionó el archivo "hemograma.pdf" de 2 MB
Cuando deja vacío el nombre y presiona "Cargar"
Entonces el sistema debe impedir la carga
Y debe mostrar el mensaje "El nombre del archivo es obligatorio"
```

#### Escenario 8: Carga sin descripción

```gherkin
Dado que el Veterinario seleccionó el archivo "foto_herida.jpg" de 3 MB
Cuando ingresa el nombre "Foto herida", deja vacía la descripción y presiona "Cargar"
Entonces el sistema debe guardar el archivo, porque la descripción es opcional
```

---

## HU-46 · Consultar listado de archivos clínicos

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario / Técnico Veterinario | RF-45 |

**Historia**

> Como Veterinario o Técnico Veterinario, quiero ver el listado de archivos clínicos de un paciente, con su nombre, formato, descripción, fecha de carga, responsable y la atención o procedimiento al que pertenecen, para encontrar rápidamente el documento que necesito revisar.

**Criterios de aceptación**

#### Escenario 1: Paciente con archivos cargados

```gherkin
Dado que el paciente "Luna" tiene 3 archivos clínicos asociados a dos atenciones distintas: "Rx tórax" (02/10/2026), "Foto herida" (15/10/2026) y "Hemograma completo" (20/10/2026)
Cuando el Veterinario abre la sección de archivos de su historia clínica
Entonces el sistema debe mostrar los 3 archivos con nombre, formato, descripción, fecha de carga, usuario responsable y atención o procedimiento asociado
Y debe ordenarlos del más reciente al más antiguo: "Hemograma completo", "Foto herida" y "Rx tórax"
```

#### Escenario 2: Consulta realizada por el Técnico Veterinario

```gherkin
Dado que el paciente "Luna" tiene los mismos 3 archivos clínicos
Cuando el Técnico Veterinario abre la sección de archivos de su historia clínica
Entonces el sistema debe mostrarle los 3 archivos con los mismos datos y en el mismo orden
```

#### Escenario 3: Paciente sin archivos cargados

```gherkin
Dado que el paciente "Max" no tiene archivos clínicos cargados
Cuando el Veterinario abre la sección de archivos de su historia clínica
Entonces el sistema debe mostrar el mensaje "El paciente no tiene archivos clínicos registrados"
```

#### Escenario 4: Archivos retirados no aparecen

```gherkin
Dado que el archivo "Rx tórax" de "Luna" fue retirado de la consulta habitual (HU-39)
Cuando el Veterinario abre la sección de archivos de su historia clínica
Entonces el sistema debe mostrar solo los 2 archivos vigentes: "Hemograma completo" y "Foto herida"
```

---

## HU-35 · Visualizar archivo PDF o imagen

> ⚠️ Número duplicado en el documento original (ya existe HU-35 «Consultar Receta Médica»). Pendiente de renumerar.

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario / Técnico Veterinario | RF-46 |

**Historia**

> Como Veterinario o Técnico Veterinario, quiero visualizar dentro del sistema un archivo PDF, JPG o PNG de la historia clínica para revisarlo sin tener que descargarlo.

**Criterios de aceptación**

#### Escenario 1: Visualizar un PDF

```gherkin
Dado que el paciente "Luna" tiene el archivo "Hemograma completo" en formato PDF
Cuando el Veterinario lo selecciona en el listado de archivos
Entonces el sistema debe mostrar el contenido del PDF dentro del sistema, sin descargarlo
```

#### Escenario 2: Visualizar una imagen JPG

```gherkin
Dado que el paciente "Luna" tiene el archivo "Foto herida" en formato JPG
Cuando el Técnico Veterinario lo selecciona en el listado de archivos
Entonces el sistema debe mostrar la imagen dentro del sistema
```

#### Escenario 3: Visualizar una imagen PNG

```gherkin
Dado que el paciente "Max" tiene el archivo "Ecografía abdomen" en formato PNG
Cuando el Veterinario lo selecciona en el listado de archivos
Entonces el sistema debe mostrar la imagen dentro del sistema
```

#### Escenario 4: Archivo PDF dañado

```gherkin
Dado que el archivo PDF "Radiografía" de "Luna" está dañado y no se puede leer
Cuando el Veterinario lo selecciona para visualizarlo
Entonces el sistema debe mostrar el mensaje "No se pudo abrir el archivo. Puede descargarlo desde el listado de archivos"
```

#### Escenario 5: Imagen dañada

```gherkin
Dado que el archivo JPG "Foto herida" de "Luna" está dañado y no se puede leer
Cuando el Técnico Veterinario lo selecciona para visualizarlo
Entonces el sistema debe mostrar el mismo mensaje "No se pudo abrir el archivo. Puede descargarlo desde el listado de archivos"
```

#### Escenario 6: Archivo en formato DICOM

```gherkin
Dado que el paciente "Rocky" tiene el archivo "Radiografía tórax" en formato DICOM
Cuando el Veterinario lo selecciona para visualizarlo como documento o imagen
Entonces el sistema no debe intentar abrirlo en este visor
Y debe mostrar el mensaje "Este archivo es un estudio DICOM. Ábralo con el visor DICOM o descárguelo desde el listado de archivos"
```

---

## HU-47 · Visualizar imágenes DICOM

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario / Técnico Veterinario | RF-46 |

**Historia**

> Como Veterinario o Técnico Veterinario, quiero visualizar dentro del sistema las imágenes DICOM de un paciente, pudiendo acercar, alejar y pasar entre las imágenes del estudio, para analizar radiografías y estudios de imagen de su historia clínica.

**Criterios de aceptación**

#### Escenario 1: Visualizar y ampliar una radiografía DICOM

```gherkin
Dado que el paciente "Rocky" tiene el archivo "Radiografía tórax" en formato DICOM
Cuando el Veterinario lo selecciona en el listado de archivos
Entonces el sistema debe mostrar la imagen en el visor DICOM
Y debe permitir acercar y alejar la imagen
```

#### Escenario 2: Pasar entre las imágenes de un estudio

```gherkin
Dado que el estudio "Radiografía tórax" de "Rocky" contiene 3 imágenes
Cuando el Técnico Veterinario lo abre en el visor DICOM y presiona "Siguiente"
Entonces el sistema debe mostrar la imagen 2 de 3
Y debe permitir volver a la imagen 1 con "Anterior"
```

#### Escenario 3: Archivo DICOM dañado

```gherkin
Dado que el estudio "Ecografía abdomen" de "Max" en formato DICOM está dañado
Cuando el Veterinario lo selecciona para visualizarlo
Entonces el sistema debe mostrar el mensaje "No se pudo abrir el estudio DICOM. Puede descargarlo desde el listado de archivos"
```

---

## HU-48 · Descargar archivo clínico

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario / Técnico Veterinario | RF-47 |

**Historia**

> Como Veterinario o Técnico Veterinario, quiero descargar desde el listado de archivos del paciente una copia de un archivo clínico para compartirla con otro especialista o entregarla al cliente.

**Criterios de aceptación**

#### Escenario 1: Descarga exitosa de un PDF

```gherkin
Dado que el paciente "Luna" tiene el archivo "Hemograma completo" en formato PDF
Cuando el Técnico Veterinario lo selecciona en el listado de archivos y presiona "Descargar"
Entonces el sistema debe descargar una copia del archivo con su mismo formato y contenido
Y la copia debe guardarse con el nombre "Hemograma completo.pdf"
```

#### Escenario 2: Descarga de un estudio DICOM

```gherkin
Dado que el paciente "Rocky" tiene el archivo "Radiografía tórax" en formato DICOM
Cuando el Veterinario lo selecciona en el listado de archivos y presiona "Descargar"
Entonces el sistema debe descargar la copia con el nombre "Radiografía tórax.dcm" y su mismo contenido
```

#### Escenario 3: Descarga fallida

```gherkin
Dado que el Veterinario está descargando el archivo "Hemograma completo" de "Luna"
Cuando se pierde la conexión antes de que termine la descarga
Entonces el sistema debe mostrar el mensaje "No se pudo descargar el archivo. Intente nuevamente"
Y el archivo original debe permanecer sin cambios
```

#### Escenario 4: La descarga no modifica el original

```gherkin
Dado que el Técnico Veterinario descargó el archivo "Hemograma completo"
Cuando vuelve a consultar el listado de archivos de "Luna"
Entonces el archivo debe conservar su nombre, descripción, fecha de carga y atención asociada sin cambios
```

---

## HU-49 · Actualizar información del archivo

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario / Técnico Veterinario | RF-48 |

**Historia**

> Como Veterinario o Técnico Veterinario, quiero modificar el nombre y la descripción de cualquier archivo clínico del paciente para corregir la identificación de un documento ya cargado.

**Criterios de aceptación**

#### Escenario 1: Actualización del nombre

```gherkin
Dado que el archivo "Hemogrma" está cargado en la historia clínica de "Luna"
Cuando el Veterinario cambia el nombre a "Hemograma completo" y presiona "Guardar"
Entonces el sistema debe mostrar el archivo con el nuevo nombre
Y debe conservar el mismo contenido, fecha de carga y atención asociada
Y debe mostrar el mensaje "Información del archivo actualizada correctamente"
```

#### Escenario 2: Actualización de la descripción por el Técnico Veterinario

```gherkin
Dado que el archivo "Hemograma completo" de "Luna" fue cargado por el Veterinario con la descripción "Control"
Cuando el Técnico Veterinario cambia la descripción a "Hemograma de control postoperatorio" y presiona "Guardar"
Entonces el sistema debe mostrar el archivo con la nueva descripción
Y debe conservar el mismo nombre, contenido, fecha de carga y atención asociada
Y debe mostrar el mensaje "Información del archivo actualizada correctamente"
```

#### Escenario 3: Nombre vacío

```gherkin
Dado que el Veterinario está editando el archivo "Hemograma completo" de "Luna"
Cuando borra el nombre y presiona "Guardar"
Entonces el sistema debe impedir el guardado
Y debe mostrar el mensaje "El nombre del archivo es obligatorio"
Y el archivo debe conservar el nombre "Hemograma completo"
```

---

## HU-50 · Retirar archivo clínico

| Actor | Requisitos vinculados |
| --- | --- |
| Veterinario / Técnico Veterinario | RF-49 |

**Historia**

> Como Veterinario, quiero retirar de la consulta habitual un archivo clínico adjuntado por error, indicando el motivo, para que no genere confusión en la historia clínica sin perder la trazabilidad del documento.

**Criterios de aceptación**

#### Escenario 1: Retiro exitoso con motivo

```gherkin
Dado que el Veterinario tiene permiso para retirar archivos y el archivo "Rx otro paciente" está en la historia clínica de "Luna"
Cuando lo selecciona, ingresa el motivo "Adjuntado al paciente equivocado", presiona "Retirar" y confirma la acción en el cuadro de confirmación
Entonces el sistema debe ocultar el archivo del listado habitual sin eliminarlo
Y debe registrar automáticamente la fecha, el responsable y el motivo del retiro
Y debe mostrar el mensaje "Archivo retirado correctamente"
```

#### Escenario 2: Cancelar el retiro

```gherkin
Dado que el Veterinario ingresó el motivo y presionó "Retirar" sobre el archivo "Rx otro paciente" de "Luna"
Cuando cancela la acción en el cuadro de confirmación
Entonces el archivo debe seguir visible en el listado sin cambios
```

#### Escenario 3: Retiro sin motivo

```gherkin
Dado que el Veterinario está retirando el archivo "Rx otro paciente" de "Luna"
Cuando deja vacío el motivo y presiona "Retirar"
```

---
