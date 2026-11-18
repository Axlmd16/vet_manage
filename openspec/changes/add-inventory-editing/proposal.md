# Propuesta: edición del catálogo de inventario

## Por qué

El catálogo ya permite registrar productos, categorías y marcas, pero los
errores de captura o cambios comerciales requieren crear registros nuevos.
Eso genera duplicados y obliga al equipo a corregir datos fuera del flujo
normal.

## Qué cambia

- Agregar actualización de categorías, marcas y productos.
- Mantener las validaciones de campos obligatorios, precios positivos y
  unicidad de nombres y códigos.
- Exponer endpoints `PATCH` y acciones de edición en el frontend.
- Reutilizar el formulario de productos para crear y editar.
- Reutilizar toast global para comunicar éxito y errores sin alertas nativas.
- Agregar escenarios BDD y pruebas unitarias de validación, conflictos y
  registros inexistentes.

## Alcance

Incluye edición de nombre y descripción de categorías/marcas, y edición de
código, nombre, descripción, precio, categoría y marca de productos.

No incluye eliminación, roles/permisos, auditoría ni cambios de migración de
datos; el esquema existente ya contiene los campos necesarios.

## Criterios de éxito

- Un usuario puede editar un producto y ver los cambios en el catálogo.
- Un usuario puede editar una categoría o marca y ver el cambio en sus listas.
- Los conflictos de nombre/código y precios inválidos no persisten cambios.
- Los IDs inexistentes responden con un error claro.
- Las pruebas backend, build/lint y validación OpenSpec pasan.
