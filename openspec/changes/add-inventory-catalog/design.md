# Design: HU-01 Catálogo de inventario

## Architecture

```text
Frontend
  Sidebar Inventario -> Productos -> Formulario / Catálogo
                         Categorías / Marcas
      |
      v
HTTP client -> Inventory API -> service -> Prisma -> PostgreSQL
                                  |
                                  +-- transaction: category/brand inline + product
```

## Data model

- `Category`: UUID, unique name, optional description, active flag.
- `Brand`: UUID, unique name, optional description, active flag.
- `Product`: UUID, unique code, required name, optional description, positive
  `Decimal(12,2)` unit price, category FK, brand FK, active flag and audit
  timestamps.
- Category and brand use soft-active flags to preserve references.

## API contract

`POST /inventory/products` accepts:

```json
{
  "code": "PR-001",
  "name": "Alimento para perro",
  "description": "Alimento seco para perros adultos",
  "unitPrice": 25.5,
  "category": { "name": "Alimentos" },
  "brand": { "name": "Dog Chow" }
}
```

`category` and `brand` can use an existing `id` or a new `name`; the service
resolves each inside the same database transaction. The success response uses
the existing API response convention with `data`. Validation errors use the
global exception envelope and field-level errors.

## Frontend UX

- `Inventario` is a keyboard-accessible disclosure in the sidebar.
- Product page has a catalog table and primary action `Nuevo producto`.
- Form is grouped into `Identificación`, `Clasificación` and `Precio`; labels
  are explicit, errors appear next to fields and the submit button has a
  loading state.
- Category and brand selectors provide an inline `Crear nueva` option using a
  compact dialog/popover; the newly created item is selected automatically.
- Empty, loading, duplicate-code, invalid-price and success states are visible.
- Mobile layout collapses the table into cards and keeps the primary action
  reachable.

## Color system

Tailwind v4 `@theme` tokens are added for `brand`, `ink`, `surface`, `muted`,
`success`, `warning` and `danger`. Feature CSS uses those tokens instead of
introducing local color literals.

## Decisions

- Description is optional because the acceptance criteria explicitly require
  accepting an empty description.
- Inline category/brand creation is handled by the product endpoint so the
  product and its new references are atomic.
- No role/permission checks are added; the API is intentionally open for this
  iteration.
