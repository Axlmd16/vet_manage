# Tareas

## Capa 0 — Especificación

- [x] Documentar propuesta, contrato y decisiones de edición.
- [x] Escribir escenarios BDD para happy path, bordes y errores.
- [x] Validar el change con OpenSpec.

## Capa 1 — Backend con TDD

- [x] Escribir pruebas rojas para actualizar categoría y marca.
- [x] Implementar PATCH de categorías y marcas con conflictos y 404.
- [x] Escribir pruebas rojas para obtener y actualizar producto.
- [x] Implementar GET/PATCH de producto con validaciones y transacción.
- [x] Agregar pruebas de controller/contrato cuando aplique.

## Capa 2 — Frontend

- [x] Agregar PATCH/GET al cliente HTTP de inventario.
- [x] Permitir edición inline de categorías y marcas con toast.
- [x] Permitir edición de productos reutilizando el formulario.
- [x] Agregar estados de carga, error, cancelación y navegación.

## Capa 3 — Verificación

- [x] Ejecutar pruebas unitarias, e2e, build y lint de backend.
- [x] Ejecutar build y lint de frontend.
- [x] Verificar manualmente edición, duplicados, precio inválido y 404.
- [x] Actualizar documentación y work log.

## Plan de paralelización

La capa 1 debe definir y estabilizar el contrato antes de cerrar la capa 2.
Las pruebas de frontend y la documentación pueden prepararse en paralelo,
pero la verificación integrada se ejecuta al final.
