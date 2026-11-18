# Proposal: HU-01 Catálogo de inventario

## Why

Vet Manage necesita registrar y consultar productos para preparar el flujo de
entradas de inventario. El catálogo debe evitar códigos duplicados, validar el
precio y permitir crear una categoría o marca directamente desde el formulario
de producto.

## What changes

- Añadir modelos Prisma `Product`, `Category` y `Brand`.
- Añadir endpoints para consultar categorías, marcas y productos.
- Añadir alta atómica de producto con creación inline de categoría/marca.
- Añadir validaciones de campos obligatorios, precio mayor que cero y código
  único.
- Añadir sidebar con sección desplegable `Inventario` y enlaces a productos,
  categorías y marcas.
- Añadir catálogo visual y formulario de registro responsive.
- Configurar tokens de color centralizados en Tailwind CSS v4.
- Cubrir los criterios con pruebas unitarias, integración/e2e y validación de
  interfaz donde aplique.

## In scope

- HU-01 Registro de productos.
- Catálogo de productos.
- Catálogos auxiliares de categorías y marcas.
- Creación inline de categoría y marca durante el alta del producto.
- Migración y persistencia PostgreSQL.

## Out of scope

- Roles, permisos y guards; todavía no existen en este flujo.
- Entradas/salidas de inventario y movimientos de stock.
- Edición/eliminación de productos, categorías o marcas.
- Login y autorización.

## Success criteria

- Todos los escenarios BDD de `specs/inventory-catalog/spec.md` pasan.
- Un producto válido se persiste y aparece en el catálogo.
- Código duplicado y precio inválido no crean registros.
- La descripción vacía se acepta.
- El usuario puede crear categoría/marca inline.
- `prisma migrate deploy`, build, lint y suites de prueba pasan.

## Tables affected

- `categories`
- `brands`
- `products`

## Endpoints

- `GET /api/v1/inventory/categories`
- `POST /api/v1/inventory/categories`
- `GET /api/v1/inventory/brands`
- `POST /api/v1/inventory/brands`
- `GET /api/v1/inventory/products`
- `POST /api/v1/inventory/products`
