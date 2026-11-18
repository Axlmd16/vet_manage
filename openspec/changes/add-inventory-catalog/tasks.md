# Tasks

## Layer 0 — BDD y contrato

- [x] 0.1 Formalizar los escenarios de HU-01 en `spec.md`.
- [x] 0.2 Definir DTOs, errores y respuestas de categorías, marcas y productos.

## Layer 1 — Persistencia

- [x] 1.1 Añadir modelos Prisma de categoría, marca y producto.
- [x] 1.2 Crear y aplicar migración PostgreSQL.

## Layer 2 — Backend TDD

- [x] 2.1 Implementar validación de producto con tests RED/GREEN/REFACTOR.
- [x] 2.2 Implementar creación inline atómica con tests.
- [x] 2.3 Implementar endpoints de catálogos y productos con tests e2e.
- [x] 2.4 Verificar duplicados, precio inválido y descripción opcional.

## Layer 3 — Frontend TDD/UX

- [x] 3.1 Centralizar tokens de color Tailwind.
- [x] 3.2 Añadir sidebar desplegable Inventario y rutas.
- [x] 3.3 Implementar catálogo de productos.
- [x] 3.4 Implementar formulario responsive con creación inline.
- [x] 3.5 Cubrir estados de carga, error, éxito y accesibilidad básica.

## Layer 4 — Integración

- [x] 4.1 Ejecutar migraciones, build, lint y todas las suites.
- [x] 4.2 Probar manualmente el flujo completo desde el frontend.
- [x] 4.3 Actualizar documentación y work log.

## Parallelization plan

- Layer 0 precede a todas las capas.
- Layer 1 puede comenzar después de fijar el contrato.
- Backend y frontend pueden avanzar en paralelo una vez establecido el
  contrato HTTP.
- Layer 4 depende de todas las anteriores.
