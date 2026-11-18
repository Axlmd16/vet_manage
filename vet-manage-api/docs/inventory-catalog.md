# Catálogo de inventario

## Flujo HU-01

El frontend expone `Inventario > Productos`, `Inventario > Categorías` e
`Inventario > Marcas`. El alta de producto permite seleccionar referencias
existentes o crear una categoría/marca desde el mismo formulario.

La descripción es opcional. Son obligatorios el código, nombre, categoría,
marca y precio unitario. El precio debe ser mayor que cero y el código es único.

## API

Todas las respuestas exitosas usan el envelope global:

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Producto registrado correctamente",
  "data": {}
}
```

Endpoints:

- `GET /api/v1/inventory/products?search=...`
- `GET /api/v1/inventory/products/:id`
- `POST /api/v1/inventory/products`
- `PATCH /api/v1/inventory/products/:id`
- `GET /api/v1/inventory/categories`
- `POST /api/v1/inventory/categories`
- `PATCH /api/v1/inventory/categories/:id`
- `GET /api/v1/inventory/brands`
- `POST /api/v1/inventory/brands`
- `PATCH /api/v1/inventory/brands/:id`

El `POST /products` es transaccional. Cada referencia puede enviarse como
`{ "id": "..." }` o `{ "name": "Nueva referencia" }`; con `name` se crea o
reactiva automáticamente.

Las actualizaciones de producto usan el mismo payload del alta y permiten
cambiar código, nombre, descripción, precio, categoría y marca. La descripción
se guarda como `null` si se envía vacía. Los nombres de categorías/marcas y el
código de producto mantienen unicidad; un conflicto responde `409` y un ID
inexistente responde `404`.

En la interfaz, categorías y marcas se editan inline desde sus listas. Los
productos se editan mediante `/inventory/products/:id/edit`, reutilizando el
formulario de registro y mostrando resultados mediante el toast global.

## Pruebas

La validación pura está en `src/modules/inventory/services/product-input.service.ts`
y sus tests cubren producto válido, campos obligatorios, precio cero/negativo y
descripción vacía. Los tests del servicio cubren creación inline, actualización
de referencias y productos, precio no positivo, IDs inexistentes y conflictos
por código/nombre; actualmente hay 14 tests backend pasando. La validación
manual del flujo completo se ejecuta contra el compose levantado.
