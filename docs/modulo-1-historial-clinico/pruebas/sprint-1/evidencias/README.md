# Evidencias por caso de prueba – Sprint 1

> Generadas por `qa/sprint-1/tools/build-evidence.mjs` a partir de los reportes de ejecución. Cada imagen es la ficha del caso: datos, resultado, pruebas que lo cubren (con el error si falló), peticiones/respuestas de la API y capturas de pantalla.

## Según la hoja del equipo (Casos de Prueba por HU Módulo 1)

Equivalencia verificada en `qa/sprint-1/matrices/equivalencia-cp-equipo.json`.

| ID equipo | ID matriz QA | HU | Caso | Resultado (retest 20/11) | Evidencia |
| --- | --- | --- | --- | --- | --- |
| CP-016 | CP-51-01 | HU-51 | Registrar un usuario del personal con un rol (Veterinario). | Pasó | [CP-016.jpg](CP-016.jpg) |
| CP-017 | CP-51-02 | HU-51 | Registrar un usuario con varios roles (Gerente y Administrador). | Pasó | [CP-017.jpg](CP-017.jpg) |
| CP-018 | CP-51-03 | HU-51 | Registrar como personal (Cajero) a una persona que ya es Cliente. | Pasó | [CP-018.jpg](CP-018.jpg) |
| CP-019 | CP-51-04 | HU-51 | Registrar un usuario sin teléfono (campo opcional). | Pasó | [CP-019.jpg](CP-019.jpg) |
| CP-020 | CP-51-05 | HU-51 | Intentar registrar con el correo vacío. | Pasó | [CP-020.jpg](CP-020.jpg) |
| CP-021 | CP-51-06 | HU-51 | Intentar registrar sin seleccionar ningún rol. | Pasó | [CP-021.jpg](CP-021.jpg) |
| CP-022 | CP-51-07 | HU-51 | Intentar registrar personal con una cédula ya registrada en el personal. | Pasó | [CP-022.jpg](CP-022.jpg) |
| CP-023 | CP-51-08 | HU-51 | Intentar registrar con cédula de formato inválido (5 dígitos). | Pasó | [CP-023.jpg](CP-023.jpg) |
| CP-024 | CP-51-09 | HU-51 | Cédula de 9 y de 11 dígitos (bordes de la longitud exacta 10). | Pasó | [CP-024.jpg](CP-024.jpg) |
| CP-025 | CP-51-10 | HU-51 | Cédula de 10 dígitos con dígito verificador incorrecto o provincia inválida. | Pasó | [CP-025.jpg](CP-025.jpg) |
| CP-026 | CP-51-11 | HU-51 | Intentar registrar un usuario con un correo ya registrado. | Pasó | [CP-026.jpg](CP-026.jpg) |
| CP-027 | CP-51-12 | HU-51 | Correo duplicado con variación de mayúsculas (R-36). | Pasó | [CP-027.jpg](CP-027.jpg) |
| CP-028 | CP-51-13 | HU-51 | Falla el envío del correo con credenciales. | Pasó | [CP-028.jpg](CP-028.jpg) |
| CP-029 | CP-51-14 | HU-51 | Un Recepcionista intenta registrar personal. | Pasó | [CP-029.jpg](CP-029.jpg) |
| CP-030 | CP-51-15 | HU-51 | Registrar usuario sin token o con token alterado. | Pasó | [CP-030.jpg](CP-030.jpg) |
| CP-031 | CP-51-16 | HU-51 | Nombres y apellidos con 100 caracteres (máximo permitido) y con 101. | Pasó | [CP-031.jpg](CP-031.jpg) |
| CP-032 | CP-51-17 | HU-51 | Asignar un rol que no es del personal (Cliente) o inexistente. | Pasó | [CP-032.jpg](CP-032.jpg) |
| CP-033 | CP-51-18 | HU-51 | El registro del usuario queda en la auditoría. | Pasó | [CP-033.jpg](CP-033.jpg) |
| CP-034 | CP-54-01 | HU-54 | Asignar un rol adicional (Cajero). | Pasó | [CP-034.jpg](CP-034.jpg) |
| CP-035 | CP-54-02 | HU-54 | Quitar un rol (Cajero). | Pasó | [CP-035.jpg](CP-035.jpg) |
| CP-036 | CP-54-03 | HU-54 | Cambiar de función: quitar Recepcionista y asignar Veterinario. | Pasó | [CP-036.jpg](CP-036.jpg) |
| CP-037 | CP-54-04 | HU-54 | Quitar el único rol sin asignar otro. | Pasó | [CP-037.jpg](CP-037.jpg) |
| CP-038 | CP-54-05 | HU-54 | Quitar el rol Administrador al último Administrador activo. | Pasó | [CP-038.jpg](CP-038.jpg) |
| CP-039 | CP-54-06 | HU-54 | Quitar Administrador cuando queda exactamente otro Administrador activo. | Pasó | [CP-039.jpg](CP-039.jpg) |
| CP-040 | CP-54-07 | HU-54 | El rol ya asignado no aparece como opción para asignar. | Pasó | [CP-040.jpg](CP-040.jpg) |
| CP-041 | CP-54-08 | HU-54 | Asignar un rol a un usuario dado de baja. | Pasó | [CP-041.jpg](CP-041.jpg) |
| CP-042 | CP-54-09 | HU-54 | Un Veterinario intenta cambiar los roles de otro usuario. | Pasó | [CP-042.jpg](CP-042.jpg) |
| CP-043 | CP-54-10 | HU-54 | Asignar un rol inexistente o de cliente. | Pasó | [CP-043.jpg](CP-043.jpg) |
| CP-044 | CP-54-11 | HU-54 | Actualizar roles de un usuario que no existe. | Pasó | [CP-044.jpg](CP-044.jpg) |
| CP-045 | CP-54-12 | HU-54 | Asignar los 7 roles del personal a la vez (máximo de la categoría STAFF). | Pasó | [CP-045.jpg](CP-045.jpg) |
| CP-046 | CP-54-13 | HU-54 | Quitar un rol mientras el usuario tiene la sesión abierta. | Pasó | [CP-046.jpg](CP-046.jpg) |
| CP-047 | CP-54-14 | HU-54 | El cambio de roles queda registrado en la auditoría. | Falló | [CP-047.jpg](CP-047.jpg) |
| CP-048 | CP-57-01 | HU-57 | Inicio de sesión exitoso. | Pasó | [CP-048.jpg](CP-048.jpg) |
| CP-049 | CP-57-02 | HU-57 | Inicio de sesión de un usuario con varios roles. | Pasó | [CP-049.jpg](CP-049.jpg) |
| CP-050 | CP-57-03 | HU-57 | Contraseña incorrecta y correo no registrado. | Pasó | [CP-050.jpg](CP-050.jpg) |
| CP-051 | CP-57-04 | HU-57 | Campos vacíos. | Pasó | [CP-051.jpg](CP-051.jpg) |
| CP-052 | CP-57-05 | HU-57 | El 4.º intento fallido NO bloquea; el 5.º sí bloquea 15 minutos. | Pasó | [CP-052.jpg](CP-052.jpg) |
| CP-053 | CP-57-06 | HU-57 | Intento con la contraseña correcta durante el bloqueo. | Pasó | [CP-053.jpg](CP-053.jpg) |
| CP-054 | CP-57-07 | HU-57 | Reinicio del contador tras un inicio de sesión correcto. | Pasó | [CP-054.jpg](CP-054.jpg) |
| CP-055 | CP-57-08 | HU-57 | Cuenta inactiva o dada de baja con credenciales correctas. | Pasó | [CP-055.jpg](CP-055.jpg) |
| CP-056 | CP-57-09 | HU-57 | Primer ingreso con contraseña temporal. | Falló | [CP-056.jpg](CP-056.jpg) |
| CP-057 | CP-57-10 | HU-57 | Acceder a /auth/me con token alterado o ausente. | Pasó | [CP-057.jpg](CP-057.jpg) |
| CP-058 | CP-01-01 | HU-01 | Registrar un cliente con datos válidos. | Falló | [CP-058.jpg](CP-058.jpg) |
| CP-059 | CP-01-02 | HU-01 | Registrar un cliente sin dirección (opcional). | Pasó | [CP-059.jpg](CP-059.jpg) |
| CP-060 | CP-01-03 | HU-01 | Veterinario y Gerente también pueden registrar clientes. | Pasó | [CP-060.jpg](CP-060.jpg) |
| CP-061 | CP-01-04 | HU-01 | Omitir campos obligatorios (cédula, nombre, apellido, correo). | Falló | [CP-061.jpg](CP-061.jpg) |
| CP-062 | CP-01-05 | HU-01 | Omitir el teléfono de contacto (obligatorio según la HU). | Falló | [CP-062.jpg](CP-062.jpg) |
| CP-063 | CP-01-06 | HU-01 | Registrar un cliente con una cédula existente. | Falló | [CP-063.jpg](CP-063.jpg) |
| CP-064 | CP-01-07 | HU-01 | Cédula alfanumérica. | Falló | [CP-064.jpg](CP-064.jpg) |
| CP-065 | CP-01-08 | HU-01 | Cédula de 9 y 11 dígitos. | Falló | [CP-065.jpg](CP-065.jpg) |
| CP-066 | CP-01-09 | HU-01 | Correo sin formato usuario@dominio.com. | Falló | [CP-066.jpg](CP-066.jpg) |
| CP-067 | CP-01-10 | HU-01 | Teléfono con caracteres alfabéticos. | Falló | [CP-067.jpg](CP-067.jpg) |
| CP-068 | CP-01-11 | HU-01 | Teléfono de 9 y de 11 dígitos (debe tener exactamente 10). | Falló | [CP-068.jpg](CP-068.jpg) |
| CP-069 | CP-01-12 | HU-01 | Teléfono de 10 dígitos con prefijo inválido (no inicia en 0). | Falló | [CP-069.jpg](CP-069.jpg) |
| CP-070 | CP-01-13 | HU-01 | Teléfono de exactamente 10 dígitos con prefijo 09 (válido). | Pasó | [CP-070.jpg](CP-070.jpg) |
| CP-071 | CP-01-14 | HU-01 | Roles sin permiso intentan registrar un cliente. | Pasó | [CP-071.jpg](CP-071.jpg) |
| CP-072 | CP-01-15 | HU-01 | Dirección de 255 caracteres (máximo) y de 256. | Pasó | [CP-072.jpg](CP-072.jpg) |
| CP-073 | CP-07-01 | HU-07 | Registrar un paciente con datos válidos. | Pasó | [CP-073.jpg](CP-073.jpg) |
| CP-074 | CP-07-02 | HU-07 | Campos obligatorios incompletos. | Pasó | [CP-074.jpg](CP-074.jpg) |
| CP-075 | CP-07-03 | HU-07 | Registrar sin el campo opcional Color. | Pasó | [CP-075.jpg](CP-075.jpg) |
| CP-076 | CP-07-04 | HU-07 | Guardar sin seleccionar cliente. | Pasó | [CP-076.jpg](CP-076.jpg) |
| CP-077 | CP-07-05 | HU-07 | Asociar el paciente a un cliente dado de baja. | Pasó | [CP-077.jpg](CP-077.jpg) |
| CP-078 | CP-07-06 | HU-07 | Asociar el paciente a un cliente inactivo. | Pasó | [CP-078.jpg](CP-078.jpg) |
| CP-079 | CP-07-07 | HU-07 | Fecha de nacimiento inexistente. | Pasó | [CP-079.jpg](CP-079.jpg) |
| CP-080 | CP-07-08 | HU-07 | Fecha de nacimiento futura. | Pasó | [CP-080.jpg](CP-080.jpg) |
| CP-081 | CP-07-09 | HU-07 | Fecha con formato distinto a DD-MM-YYYY. | Pasó | [CP-081.jpg](CP-081.jpg) |
| CP-082 | CP-07-10 | HU-07 | Fecha de nacimiento igual a hoy (borde de "futura"). | Pasó | [CP-082.jpg](CP-082.jpg) |
| CP-083 | CP-07-11 | HU-07 | Fecha 29-02 en año bisiesto y no bisiesto. | Pasó | [CP-083.jpg](CP-083.jpg) |
| CP-084 | CP-07-12 | HU-07 | Peso igual a cero. | Pasó | [CP-084.jpg](CP-084.jpg) |
| CP-085 | CP-07-13 | HU-07 | Talla negativa y peso no numérico. | Pasó | [CP-085.jpg](CP-085.jpg) |
| CP-086 | CP-07-14 | HU-07 | Peso mínimo 0.01 y máximo 9999.99. | Pasó | [CP-086.jpg](CP-086.jpg) |
| CP-087 | CP-07-15 | HU-07 | Peso o talla mayor que el máximo (10000). | Pasó | [CP-087.jpg](CP-087.jpg) |
| CP-088 | CP-07-16 | HU-07 | El código identificador se genera automáticamente, es único y no editable. | Pasó | [CP-088.jpg](CP-088.jpg) |
| CP-089 | CP-07-17 | HU-07 | La raza no corresponde a la especie. | Pasó | [CP-089.jpg](CP-089.jpg) |
| CP-090 | CP-07-18 | HU-07 | Registrar con una especie inactiva. | Pasó | [CP-090.jpg](CP-090.jpg) |
| CP-091 | CP-07-19 | HU-07 | Roles sin permiso intentan registrar un paciente. | Pasó | [CP-091.jpg](CP-091.jpg) |
| CP-092 | CP-07-20 | HU-07 | Nombre de 100/101 caracteres y color de 50/51. | Pasó | [CP-092.jpg](CP-092.jpg) |
| CP-093 | CP-13-01 | HU-13 | Registrar una especie con nombre y descripción. | Pasó | [CP-093.jpg](CP-093.jpg) |
| CP-094 | CP-13-02 | HU-13 | Guardar sin nombre. | Pasó | [CP-094.jpg](CP-094.jpg) |
| CP-095 | CP-13-03 | HU-13 | Nombre compuesto solo por espacios. | Pasó | [CP-095.jpg](CP-095.jpg) |
| CP-096 | CP-13-04 | HU-13 | Registrar sin descripción (opcional). | Pasó | [CP-096.jpg](CP-096.jpg) |
| CP-097 | CP-13-05 | HU-13 | Cancelar el registro. | Pasó | [CP-097.jpg](CP-097.jpg) |
| CP-098 | CP-13-06 | HU-13 | Nombre duplicado (también con otra combinación de mayúsculas). | Pasó | [CP-098.jpg](CP-098.jpg) |
| CP-099 | CP-13-07 | HU-13 | Nombre de 100 caracteres (máximo) y de 101. | Pasó | [CP-099.jpg](CP-099.jpg) |
| CP-100 | CP-13-08 | HU-13 | Un Recepcionista intenta registrar una especie. | Pasó | [CP-100.jpg](CP-100.jpg) |
| CP-101 | CP-13-09 | HU-13 | El Administrador intenta registrar una especie (la matriz de roles solo lo permite al Veterinario). | Pasó | [CP-101.jpg](CP-101.jpg) |

## Según la matriz QA

| Caso | HU | Resultado | Contiene | Evidencia |
| --- | --- | --- | --- | --- |
| CP-51-01 | HU-51 | Pasó | pruebas, API, capturas | [CP-51-01.jpg](CP-51-01.jpg) |
| CP-51-02 | HU-51 | Pasó | pruebas, API | [CP-51-02.jpg](CP-51-02.jpg) |
| CP-51-03 | HU-51 | Pasó | pruebas, API | [CP-51-03.jpg](CP-51-03.jpg) |
| CP-51-04 | HU-51 | Pasó | pruebas | [CP-51-04.jpg](CP-51-04.jpg) |
| CP-51-05 | HU-51 | Pasó | pruebas, API, capturas | [CP-51-05.jpg](CP-51-05.jpg) |
| CP-51-06 | HU-51 | Pasó | pruebas, API | [CP-51-06.jpg](CP-51-06.jpg) |
| CP-51-07 | HU-51 | Pasó | pruebas, API | [CP-51-07.jpg](CP-51-07.jpg) |
| CP-51-08 | HU-51 | Pasó | pruebas, API | [CP-51-08.jpg](CP-51-08.jpg) |
| CP-51-09 | HU-51 | Pasó | pruebas | [CP-51-09.jpg](CP-51-09.jpg) |
| CP-51-10 | HU-51 | Pasó | pruebas | [CP-51-10.jpg](CP-51-10.jpg) |
| CP-51-11 | HU-51 | Pasó | pruebas, API | [CP-51-11.jpg](CP-51-11.jpg) |
| CP-51-12 | HU-51 | Pasó | pruebas, API | [CP-51-12.jpg](CP-51-12.jpg) |
| CP-51-13 | HU-51 | Pasó | pruebas | [CP-51-13.jpg](CP-51-13.jpg) |
| CP-51-14 | HU-51 | Pasó | pruebas, API, capturas | [CP-51-14.jpg](CP-51-14.jpg) |
| CP-51-15 | HU-51 | Pasó | pruebas, API | [CP-51-15.jpg](CP-51-15.jpg) |
| CP-51-16 | HU-51 | Pasó | pruebas | [CP-51-16.jpg](CP-51-16.jpg) |
| CP-51-17 | HU-51 | Pasó | pruebas, API | [CP-51-17.jpg](CP-51-17.jpg) |
| CP-51-18 | HU-51 | Pasó | pruebas, API | [CP-51-18.jpg](CP-51-18.jpg) |
| CP-54-01 | HU-54 | Pasó | pruebas, API, capturas | [CP-54-01.jpg](CP-54-01.jpg) |
| CP-54-02 | HU-54 | Pasó | pruebas, API | [CP-54-02.jpg](CP-54-02.jpg) |
| CP-54-03 | HU-54 | Pasó | pruebas, API | [CP-54-03.jpg](CP-54-03.jpg) |
| CP-54-04 | HU-54 | Pasó | pruebas, API, capturas | [CP-54-04.jpg](CP-54-04.jpg) |
| CP-54-05 | HU-54 | Pasó | pruebas | [CP-54-05.jpg](CP-54-05.jpg) |
| CP-54-06 | HU-54 | Pasó | pruebas, API | [CP-54-06.jpg](CP-54-06.jpg) |
| CP-54-07 | HU-54 | Pasó | pruebas, API, capturas | [CP-54-07.jpg](CP-54-07.jpg) |
| CP-54-08 | HU-54 | Pasó | pruebas, API | [CP-54-08.jpg](CP-54-08.jpg) |
| CP-54-09 | HU-54 | Pasó | pruebas, API | [CP-54-09.jpg](CP-54-09.jpg) |
| CP-54-10 | HU-54 | Pasó | pruebas, API | [CP-54-10.jpg](CP-54-10.jpg) |
| CP-54-11 | HU-54 | Pasó | pruebas, API | [CP-54-11.jpg](CP-54-11.jpg) |
| CP-54-12 | HU-54 | Pasó | pruebas | [CP-54-12.jpg](CP-54-12.jpg) |
| CP-54-13 | HU-54 | Pasó | pruebas, API | [CP-54-13.jpg](CP-54-13.jpg) |
| CP-54-14 | HU-54 | Falló | pruebas, API | [CP-54-14.jpg](CP-54-14.jpg) |
| CP-57-01 | HU-57 | Pasó | pruebas, API, capturas | [CP-57-01.jpg](CP-57-01.jpg) |
| CP-57-02 | HU-57 | Pasó | pruebas, API | [CP-57-02.jpg](CP-57-02.jpg) |
| CP-57-03 | HU-57 | Pasó | pruebas, API, capturas | [CP-57-03.jpg](CP-57-03.jpg) |
| CP-57-04 | HU-57 | Pasó | pruebas, API, capturas | [CP-57-04.jpg](CP-57-04.jpg) |
| CP-57-05 | HU-57 | Pasó | pruebas, API, capturas | [CP-57-05.jpg](CP-57-05.jpg) |
| CP-57-06 | HU-57 | Pasó | pruebas, API, capturas | [CP-57-06.jpg](CP-57-06.jpg) |
| CP-57-07 | HU-57 | Pasó | pruebas, API, consola | [CP-57-07.jpg](CP-57-07.jpg) |
| CP-57-08 | HU-57 | Pasó | pruebas, API | [CP-57-08.jpg](CP-57-08.jpg) |
| CP-57-09 | HU-57 | Falló | pruebas, API, capturas | [CP-57-09.jpg](CP-57-09.jpg) |
| CP-57-10 | HU-57 | Pasó | pruebas, API | [CP-57-10.jpg](CP-57-10.jpg) |
| CP-01-01 | HU-01 | Falló | pruebas, API, capturas | [CP-01-01.jpg](CP-01-01.jpg) |
| CP-01-02 | HU-01 | Pasó | pruebas, API | [CP-01-02.jpg](CP-01-02.jpg) |
| CP-01-03 | HU-01 | Pasó | pruebas, API | [CP-01-03.jpg](CP-01-03.jpg) |
| CP-01-04 | HU-01 | Falló | pruebas, API, capturas | [CP-01-04.jpg](CP-01-04.jpg) |
| CP-01-05 | HU-01 | Falló | pruebas, API | [CP-01-05.jpg](CP-01-05.jpg) |
| CP-01-06 | HU-01 | Falló | pruebas, API | [CP-01-06.jpg](CP-01-06.jpg) |
| CP-01-07 | HU-01 | Falló | pruebas, API | [CP-01-07.jpg](CP-01-07.jpg) |
| CP-01-08 | HU-01 | Falló | pruebas | [CP-01-08.jpg](CP-01-08.jpg) |
| CP-01-09 | HU-01 | Falló | pruebas, API | [CP-01-09.jpg](CP-01-09.jpg) |
| CP-01-10 | HU-01 | Falló | pruebas, API | [CP-01-10.jpg](CP-01-10.jpg) |
| CP-01-11 | HU-01 | Falló | pruebas, API | [CP-01-11.jpg](CP-01-11.jpg) |
| CP-01-12 | HU-01 | Falló | pruebas, API | [CP-01-12.jpg](CP-01-12.jpg) |
| CP-01-13 | HU-01 | Pasó | pruebas | [CP-01-13.jpg](CP-01-13.jpg) |
| CP-01-14 | HU-01 | Pasó | pruebas, API, capturas | [CP-01-14.jpg](CP-01-14.jpg) |
| CP-01-15 | HU-01 | Pasó | pruebas | [CP-01-15.jpg](CP-01-15.jpg) |
| CP-06-01 | HU-06 | Falló | capturas | [CP-06-01.jpg](CP-06-01.jpg) |
| CP-06-02 | HU-06 | Falló | — | [CP-06-02.jpg](CP-06-02.jpg) |
| CP-06-03 | HU-06 | Bloqueado | — | [CP-06-03.jpg](CP-06-03.jpg) |
| CP-06-04 | HU-06 | Pasó | — | [CP-06-04.jpg](CP-06-04.jpg) |
| CP-07-01 | HU-07 | Pasó | pruebas, API, capturas | [CP-07-01.jpg](CP-07-01.jpg) |
| CP-07-02 | HU-07 | Pasó | pruebas, API | [CP-07-02.jpg](CP-07-02.jpg) |
| CP-07-03 | HU-07 | Pasó | pruebas, API | [CP-07-03.jpg](CP-07-03.jpg) |
| CP-07-04 | HU-07 | Pasó | pruebas, API, capturas | [CP-07-04.jpg](CP-07-04.jpg) |
| CP-07-05 | HU-07 | Pasó | pruebas, API, capturas | [CP-07-05.jpg](CP-07-05.jpg) |
| CP-07-06 | HU-07 | Pasó | pruebas, API | [CP-07-06.jpg](CP-07-06.jpg) |
| CP-07-07 | HU-07 | Pasó | pruebas, API | [CP-07-07.jpg](CP-07-07.jpg) |
| CP-07-08 | HU-07 | Pasó | pruebas, API | [CP-07-08.jpg](CP-07-08.jpg) |
| CP-07-09 | HU-07 | Pasó | pruebas | [CP-07-09.jpg](CP-07-09.jpg) |
| CP-07-10 | HU-07 | Pasó | pruebas, API | [CP-07-10.jpg](CP-07-10.jpg) |
| CP-07-11 | HU-07 | Pasó | pruebas | [CP-07-11.jpg](CP-07-11.jpg) |
| CP-07-12 | HU-07 | Pasó | pruebas, API | [CP-07-12.jpg](CP-07-12.jpg) |
| CP-07-13 | HU-07 | Pasó | pruebas | [CP-07-13.jpg](CP-07-13.jpg) |
| CP-07-14 | HU-07 | Pasó | pruebas, API | [CP-07-14.jpg](CP-07-14.jpg) |
| CP-07-15 | HU-07 | Pasó | pruebas | [CP-07-15.jpg](CP-07-15.jpg) |
| CP-07-16 | HU-07 | Pasó | pruebas, API, capturas | [CP-07-16.jpg](CP-07-16.jpg) |
| CP-07-17 | HU-07 | Pasó | pruebas, API | [CP-07-17.jpg](CP-07-17.jpg) |
| CP-07-18 | HU-07 | Pasó | pruebas, API | [CP-07-18.jpg](CP-07-18.jpg) |
| CP-07-19 | HU-07 | Pasó | pruebas, API | [CP-07-19.jpg](CP-07-19.jpg) |
| CP-07-20 | HU-07 | Pasó | pruebas | [CP-07-20.jpg](CP-07-20.jpg) |
| CP-12-01 | HU-12 | Falló | capturas | [CP-12-01.jpg](CP-12-01.jpg) |
| CP-12-02 | HU-12 | Bloqueado | — | [CP-12-02.jpg](CP-12-02.jpg) |
| CP-12-03 | HU-12 | Bloqueado | — | [CP-12-03.jpg](CP-12-03.jpg) |
| CP-12-04 | HU-12 | Bloqueado | — | [CP-12-04.jpg](CP-12-04.jpg) |
| CP-12-05 | HU-12 | Bloqueado | — | [CP-12-05.jpg](CP-12-05.jpg) |
| CP-12-06 | HU-12 | Bloqueado | — | [CP-12-06.jpg](CP-12-06.jpg) |
| CP-12-07 | HU-12 | Bloqueado | — | [CP-12-07.jpg](CP-12-07.jpg) |
| CP-12-08 | HU-12 | Bloqueado | — | [CP-12-08.jpg](CP-12-08.jpg) |
| CP-12-09 | HU-12 | Sin ejecutar | — | [CP-12-09.jpg](CP-12-09.jpg) |
| CP-13-01 | HU-13 | Pasó | pruebas, API, capturas | [CP-13-01.jpg](CP-13-01.jpg) |
| CP-13-02 | HU-13 | Pasó | pruebas, API, capturas | [CP-13-02.jpg](CP-13-02.jpg) |
| CP-13-03 | HU-13 | Pasó | pruebas | [CP-13-03.jpg](CP-13-03.jpg) |
| CP-13-04 | HU-13 | Pasó | pruebas, API | [CP-13-04.jpg](CP-13-04.jpg) |
| CP-13-05 | HU-13 | Pasó | pruebas, capturas | [CP-13-05.jpg](CP-13-05.jpg) |
| CP-13-06 | HU-13 | Pasó | pruebas, API | [CP-13-06.jpg](CP-13-06.jpg) |
| CP-13-07 | HU-13 | Pasó | pruebas, API | [CP-13-07.jpg](CP-13-07.jpg) |
| CP-13-08 | HU-13 | Pasó | pruebas, API | [CP-13-08.jpg](CP-13-08.jpg) |
| CP-13-09 | HU-13 | Pasó | pruebas, API | [CP-13-09.jpg](CP-13-09.jpg) |
| CP-17-01 | HU-17 | Pasó | — | [CP-17-01.jpg](CP-17-01.jpg) |
| CP-17-02 | HU-17 | Sin ejecutar | — | [CP-17-02.jpg](CP-17-02.jpg) |
| CP-17-03 | HU-17 | Sin ejecutar | — | [CP-17-03.jpg](CP-17-03.jpg) |
| CP-17-04 | HU-17 | Pasó | capturas | [CP-17-04.jpg](CP-17-04.jpg) |
| CP-17-05 | HU-17 | Sin ejecutar | — | [CP-17-05.jpg](CP-17-05.jpg) |
| CP-17-06 | HU-17 | Sin ejecutar | — | [CP-17-06.jpg](CP-17-06.jpg) |
| CP-17-07 | HU-17 | Pasó | — | [CP-17-07.jpg](CP-17-07.jpg) |
| CP-17-08 | HU-17 | Pasó | — | [CP-17-08.jpg](CP-17-08.jpg) |
| CP-17-09 | HU-17 | Pasó | — | [CP-17-09.jpg](CP-17-09.jpg) |
| CP-17-10 | HU-17 | Pasó | — | [CP-17-10.jpg](CP-17-10.jpg) |
