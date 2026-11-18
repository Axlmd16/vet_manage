# Matriz de roles y permisos – Módulo 1

Qué puede hacer cada rol en el Módulo 1 – Historial Clínico y en la parte de autenticación. Se basa en la matriz de roles y permisos del grupo (06/11/2026), detallada por función y con la HU de cada una.

- ✅ el rol puede realizar la función.
- — el rol no tiene acceso.
- Un usuario puede tener varios roles. Sus permisos son la suma de los permisos de cada rol (por ejemplo, Gerente + Administrador).
- El Administrador puede cambiar estos permisos desde el sistema (HU-56). Esta matriz es la configuración inicial.

## Parte 1. Funciones generales (todos los usuarios)

Las puede usar cualquier persona con cuenta, sin importar su rol.

| Función              | HU    | Administrador | Gerente | Veterinario | Técnico Veterinario | Recepcionista | Cajero | Bodeguero | Cliente |
| -------------------- | ----- | :-----------: | :-----: | :---------: | :-----------------: | :-----------: | :----: | :-------: | :-----: |
| Iniciar sesión       | HU-57 |      ✅       |   ✅    |     ✅      |         ✅          |      ✅       |   ✅   |    ✅     |   ✅    |
| Recuperar contraseña | HU-58 |      ✅       |   ✅    |     ✅      |         ✅          |      ✅       |   ✅   |    ✅     |   ✅    |
| Cambiar contraseña   | HU-59 |      ✅       |   ✅    |     ✅      |         ✅          |      ✅       |   ✅   |    ✅     |   ✅    |

## Parte 2. Módulo 1 – Historial Clínico

Funciones que dependen del rol.

### 2.1 Usuarios, permisos y auditoría

| Función                        | HU    | Administrador | Gerente | Veterinario | Técnico Veterinario | Recepcionista | Cajero | Bodeguero |
| ------------------------------ | ----- | :-----------: | :-----: | :---------: | :-----------------: | :-----------: | :----: | :-------: |
| Registrar usuario              | HU-51 |      ✅       |    —    |      —      |          —          |       —       |   —    |     —     |
| Consultar usuarios             | HU-52 |      ✅       |    —    |      —      |          —          |       —       |   —    |     —     |
| Actualizar datos de usuario    | HU-53 |      ✅       |    —    |      —      |          —          |       —       |   —    |     —     |
| Asignar y quitar roles         | HU-54 |      ✅       |    —    |      —      |          —          |       —       |   —    |     —     |
| Activar e inactivar cuenta     | HU-55 |      ✅       |    —    |      —      |          —          |       —       |   —    |     —     |
| Gestionar permisos por rol     | HU-56 |      ✅       |    —    |      —      |          —          |       —       |   —    |     —     |
| Consultar y exportar auditoría | HU-60 |      ✅       |    —    |      —      |          —          |       —       |   —    |     —     |
| Dar de baja usuario            | HU-61 |      ✅       |    —    |      —      |          —          |       —       |   —    |     —     |

### 2.2 Clientes

| Función             | HU    | Administrador | Gerente | Veterinario | Técnico Veterinario | Recepcionista | Cajero | Bodeguero |
| ------------------- | ----- | :-----------: | :-----: | :---------: | :-----------------: | :-----------: | :----: | :-------: |
| Registrar cliente   | HU-01 |       —       |   ✅    |     ✅      |          —          |      ✅       |   —    |     —     |
| Actualizar cliente  | HU-02 |       —       |   ✅    |     ✅      |          —          |      ✅       |   —    |     —     |
| Inactivar cliente   | HU-04 |       —       |   ✅    |     ✅      |          —          |      ✅       |   —    |     —     |
| Activar cliente     | HU-05 |       —       |   ✅    |     ✅      |          —          |      ✅       |   —    |     —     |
| Consultar clientes  | HU-06 |       —       |   ✅    |     ✅      |         ✅          |      ✅       |   —    |     —     |
| Dar de baja cliente | HU-03 |       —       |   ✅    |     ✅      |          —          |       —       |   —    |     —     |

### 2.3 Pacientes

| Función              | HU    | Administrador | Gerente | Veterinario | Técnico Veterinario | Recepcionista | Cajero | Bodeguero |
| -------------------- | ----- | :-----------: | :-----: | :---------: | :-----------------: | :-----------: | :----: | :-------: |
| Registrar paciente   | HU-07 |       —       |   ✅    |      —      |          —          |      ✅       |   —    |     —     |
| Actualizar paciente  | HU-08 |       —       |   ✅    |     ✅      |          —          |      ✅       |   —    |     —     |
| Inactivar paciente   | HU-10 |       —       |   ✅    |      —      |          —          |      ✅       |   —    |     —     |
| Activar paciente     | HU-11 |       —       |   ✅    |      —      |          —          |      ✅       |   —    |     —     |
| Consultar pacientes  | HU-12 |       —       |   ✅    |     ✅      |         ✅          |      ✅       |   —    |     —     |
| Dar de baja paciente | HU-09 |       —       |   ✅    |     ✅      |          —          |       —       |   —    |     —     |

### 2.4 Especies y razas

| Función                     | HU    | Administrador | Gerente | Veterinario | Técnico Veterinario | Recepcionista | Cajero | Bodeguero |
| --------------------------- | ----- | :-----------: | :-----: | :---------: | :-----------------: | :-----------: | :----: | :-------: |
| Registrar especie           | HU-13 |       —       |    —    |     ✅      |          —          |       —       |   —    |     —     |
| Actualizar especie          | HU-14 |       —       |    —    |     ✅      |          —          |       —       |   —    |     —     |
| Activar e inactivar especie | HU-15 |       —       |    —    |     ✅      |          —          |       —       |   —    |     —     |
| Consultar especies          | HU-16 |       —       |   ✅    |     ✅      |         ✅          |      ✅       |   —    |     —     |
| Registrar raza              | HU-17 |       —       |    —    |     ✅      |          —          |       —       |   —    |     —     |
| Actualizar raza             | HU-18 |       —       |    —    |     ✅      |          —          |       —       |   —    |     —     |
| Activar e inactivar raza    | HU-19 |       —       |    —    |     ✅      |          —          |       —       |   —    |     —     |
| Consultar razas             | HU-20 |       —       |   ✅    |     ✅      |         ✅          |      ✅       |   —    |     —     |

### 2.5 Historia y atención clínica

| Función                                   | HU    | Administrador | Gerente | Veterinario | Técnico Veterinario | Recepcionista | Cajero | Bodeguero |
| ----------------------------------------- | ----- | :-----------: | :-----: | :---------: | :-----------------: | :-----------: | :----: | :-------: |
| Registrar historia clínica (antecedentes) | HU-29 |       —       |    —    |     ✅      |          —          |       —       |   —    |     —     |
| Registrar atención clínica                | HU-30 |       —       |    —    |     ✅      |          —          |       —       |   —    |     —     |
| Registrar diagnóstico                     | HU-31 |       —       |    —    |     ✅      |          —          |       —       |   —    |     —     |
| Corregir atención clínica                 | HU-32 |       —       |    —    |     ✅      |          —          |       —       |   —    |     —     |
| Ver historial clínico                     | HU-33 |       —       |    —    |     ✅      |         ✅          |       —       |   —    |     —     |

### 2.6 Recetas médicas

| Función                   | HU    | Administrador | Gerente | Veterinario | Técnico Veterinario | Recepcionista | Cajero | Bodeguero |
| ------------------------- | ----- | :-----------: | :-----: | :---------: | :-----------------: | :-----------: | :----: | :-------: |
| Registrar y editar receta | HU-34 |       —       |    —    |     ✅      |          —          |       —       |   —    |     —     |
| Consultar recetas         | HU-35 |       —       |    —    |     ✅      |          —          |       —       |   —    |     —     |
| Generar receta en PDF     | HU-36 |       —       |    —    |     ✅      |          —          |       —       |   —    |     —     |

### 2.7 Vacunación y desparasitación

| Función                     | HU    | Administrador | Gerente | Veterinario | Técnico Veterinario | Recepcionista | Cajero | Bodeguero |
| --------------------------- | ----- | :-----------: | :-----: | :---------: | :-----------------: | :-----------: | :----: | :-------: |
| Registrar vacunación        | HU-21 |       —       |    —    |     ✅      |         ✅          |       —       |   —    |     —     |
| Editar vacunación           | HU-22 |       —       |    —    |     ✅      |         ✅          |       —       |   —    |     —     |
| Consultar vacunaciones      | HU-23 |       —       |    —    |     ✅      |         ✅          |       —       |   —    |     —     |
| Anular vacunación           | HU-24 |       —       |    —    |     ✅      |         ✅          |       —       |   —    |     —     |
| Registrar desparasitación   | HU-25 |       —       |    —    |     ✅      |         ✅          |       —       |   —    |     —     |
| Editar desparasitación      | HU-26 |       —       |    —    |     ✅      |         ✅          |       —       |   —    |     —     |
| Consultar desparasitaciones | HU-27 |       —       |    —    |     ✅      |         ✅          |       —       |   —    |     —     |
| Anular desparasitación      | HU-28 |       —       |    —    |     ✅      |         ✅          |       —       |   —    |     —     |

### 2.8 Tipos de procedimiento clínico

| Función                          | HU    | Administrador | Gerente | Veterinario | Técnico Veterinario | Recepcionista | Cajero | Bodeguero |
| -------------------------------- | ----- | :-----------: | :-----: | :---------: | :-----------------: | :-----------: | :----: | :-------: |
| Registrar tipo de procedimiento  | HU-37 |       —       |   ✅    |     ✅      |          —          |       —       |   —    |     —     |
| Consultar tipos de procedimiento | —     |       —       |   ✅    |     ✅      |         ✅          |       —       |   —    |     —     |
| Inactivar tipo de procedimiento  | HU-38 |       —       |   ✅    |     ✅      |          —          |       —       |   —    |     —     |

### 2.9 Procedimientos clínicos

| Función                                | HU    | Administrador | Gerente | Veterinario | Técnico Veterinario | Recepcionista | Cajero | Bodeguero |
| -------------------------------------- | ----- | :-----------: | :-----: | :---------: | :-----------------: | :-----------: | :----: | :-------: |
| Registrar procedimiento del catálogo   | HU-39 |       —       |   ✅    |     ✅      |          —          |       —       |   —    |     —     |
| Consultar procedimientos del catálogo  | —     |       —       |   ✅    |     ✅      |         ✅          |       —       |   —    |     —     |
| Dar de baja procedimiento del catálogo | HU-40 |       —       |   ✅    |     ✅      |          —          |       —       |   —    |     —     |
| Registrar informe del procedimiento    | HU-41 |       —       |    —    |     ✅      |         ✅          |       —       |   —    |     —     |
| Corregir informe del procedimiento     | HU-42 |       —       |    —    |     ✅      |          —          |       —       |   —    |     —     |

### 2.10 Insumos utilizados

| Función                               | HU    | Administrador | Gerente | Veterinario | Técnico Veterinario | Recepcionista | Cajero | Bodeguero |
| ------------------------------------- | ----- | :-----------: | :-----: | :---------: | :-----------------: | :-----------: | :----: | :-------: |
| Registrar insumos utilizados          | HU-43 |       —       |    —    |     ✅      |         ✅          |       —       |   —    |     —     |
| Retirar insumo del listado (corregir) | HU-44 |       —       |    —    |     ✅      |          —          |       —       |   —    |     —     |

### 2.11 Archivos clínicos

| Función                            | HU           | Administrador | Gerente | Veterinario | Técnico Veterinario | Recepcionista | Cajero | Bodeguero |
| ---------------------------------- | ------------ | :-----------: | :-----: | :---------: | :-----------------: | :-----------: | :----: | :-------: |
| Adjuntar archivo                   | HU-45        |       —       |    —    |     ✅      |         ✅          |       —       |   —    |     —     |
| Consultar listado de archivos      | HU-46        |       —       |    —    |     ✅      |         ✅          |       —       |   —    |     —     |
| Visualizar PDF o imagen            | HU-35 (dup.) |       —       |    —    |     ✅      |         ✅          |       —       |   —    |     —     |
| Visualizar imágenes DICOM          | HU-47        |       —       |    —    |     ✅      |         ✅          |       —       |   —    |     —     |
| Descargar archivo                  | HU-48        |       —       |    —    |     ✅      |         ✅          |       —       |   —    |     —     |
| Actualizar información del archivo | HU-49        |       —       |    —    |     ✅      |         ✅          |       —       |   —    |     —     |
| Retirar archivo                    | HU-50        |       —       |    —    |     ✅      |         ✅          |       —       |   —    |     —     |

## Observaciones

- **Cajero y Bodeguero** no tienen funciones en el Módulo 1. Solo usan las funciones generales; sus permisos están en el Módulo 3.
- **Auditoría:** el Administrador solo la consulta y la exporta. Nadie puede modificar ni eliminar sus registros.
- **Dar de baja usuario (HU-61)** se marca para el Administrador, aunque en la matriz anterior _Gestionar_ no incluía dar de baja.
- **Técnico Veterinario** registra informes de procedimientos e insumos, pero no los corrige. Las correcciones son del Veterinario.
- Las acciones _Ver_, _Visualizar_ y _Descargar_ archivos se tomaron como parte de _Ver_.
