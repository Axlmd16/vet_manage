# Módulo 1 – Historial Clínico

Documentación funcional del Módulo 1 de VetManage (Grupo 1). Incluye la gestión de clientes, pacientes, catálogos, vacunación, historia clínica, procedimientos, insumos, archivos clínicos y la autenticación y autorización del sistema.

Esta carpeta solo contiene lo que corresponde al Módulo 1. Los Módulos 2 (Agendamiento de citas) y 3 (Inventario y ventas) tienen su propia carpeta en `docs/`.

## Contenido

| Carpeta / archivo | Qué contiene |
| --- | --- |
| [`historias-usuario/`](historias-usuario/) | Historias de usuario HU-01 a HU-61 con sus criterios de aceptación en Gherkin, un archivo por área. |
| [`diagramas/clases.md`](diagramas/clases.md) | Diagrama de clases lógico del módulo (Mermaid), enumeraciones, relaciones y patrones de análisis. |
| [`diagramas/estados.md`](diagramas/estados.md) | Diagramas de estado de las entidades principales (Mermaid). |
| [`matriz-roles-permisos.md`](matriz-roles-permisos.md) | Qué puede hacer cada rol en cada funcionalidad del módulo. |

## Historias de usuario por área

| Archivo | Área | HU | Cantidad |
| --- | --- | --- | --- |
| [`01-clientes.md`](historias-usuario/01-clientes.md) | Gestión de clientes | HU-01 a HU-06 | 6 |
| [`02-pacientes.md`](historias-usuario/02-pacientes.md) | Gestión de pacientes | HU-07 a HU-12 | 6 |
| [`03-especies-razas.md`](historias-usuario/03-especies-razas.md) | Catálogo de especies y razas | HU-13 a HU-20 | 8 |
| [`04-vacunacion-desparasitacion.md`](historias-usuario/04-vacunacion-desparasitacion.md) | Vacunación y desparasitación | HU-21 a HU-28 | 8 |
| [`05-historia-atencion-receta.md`](historias-usuario/05-historia-atencion-receta.md) | Historia clínica, atención y receta | HU-29 a HU-36 | 8 |
| [`06-procedimientos.md`](historias-usuario/06-procedimientos.md) | Procedimientos clínicos | HU-37 a HU-42 | 6 |
| [`07-insumos-archivos.md`](historias-usuario/07-insumos-archivos.md) | Insumos utilizados y archivos clínicos | HU-43 a HU-50 | 9 |
| [`08-autenticacion-usuarios.md`](historias-usuario/08-autenticacion-usuarios.md) | Autenticación, usuarios y auditoría | HU-51 a HU-61 | 11 |

## Roles del sistema

Administrador, Gerente, Veterinario, Técnico Veterinario, Recepcionista, Cajero, Bodeguero y Cliente. Un usuario puede tener varios roles; sus permisos son la suma de los permisos de cada rol.

## Cómo usar esta documentación

- **Al desarrollar una HU:** lee su archivo de historias y el diagrama de clases. Los criterios de aceptación son lo que se prueba para dar la HU por terminada.
- **Con OpenSpec:** crea un cambio por HU (por ejemplo `/opsx:propose hu-57-iniciar-sesion`) e indica en la propuesta los archivos de esta carpeta que debe leer. No uses la documentación de otros módulos.
- **Ramas:** `feature/HU-XX-nombre-corto` desde `development`, con un Pull Request por HU.

## Convenciones

- Las HU se identifican como `HU-XX` y los requisitos como `RF-XX`.
- Los diagramas se escriben en Mermaid para que GitHub los muestre y se puedan revisar en un Pull Request.
- Cualquier cambio a una HU o a un diagrama se hace por Pull Request, igual que el código.

## Pendientes conocidos

- El número HU-35 está repetido: «Consultar Receta Médica» y «Visualizar archivo PDF o imagen». Hay que renumerar una de las dos.
- HU-10 y HU-11 no tienen requisito vinculado.
