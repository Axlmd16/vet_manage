# Diseño: edición del catálogo de inventario

## Contrato HTTP

Se agregan estos endpoints bajo `/api/v1/inventory`:

- `PATCH /categories/:id` con `{ name, description? }`.
- `PATCH /brands/:id` con `{ name, description? }`.
- `GET /products/:id` para cargar el formulario de edición.
- `PATCH /products/:id` con el mismo contrato del registro de producto.

Las respuestas mantienen el envelope `{ statusCode, success, message, data }`.
Los conflictos de unicidad responden `409`; validaciones `400`; IDs ausentes
`404`.

## Arquitectura

```text
Controller (PATCH/GET)
  -> InventoryService (validación, transacción, mapeo de errores)
    -> PrismaService (Category, Brand, Product)
  -> response envelope -> frontend inventoryApi -> páginas y toast
```

La edición de producto se ejecuta en una transacción para resolver referencias
de categoría/marca y actualizar el producto de forma consistente.

## Decisiones

- Se reutilizan los DTOs de creación para exigir los mismos campos esenciales
  durante una edición completa.
- La descripción continúa siendo opcional y se normaliza a `null` cuando está
  vacía.
- El código de producto también se puede editar, pero conserva unicidad.
- Categorías y marcas se editan inline en sus listas para reducir navegación.
- El formulario de producto se reutiliza para crear y editar y carga el
  registro actual desde la API, por lo que funciona también tras un refresh.
