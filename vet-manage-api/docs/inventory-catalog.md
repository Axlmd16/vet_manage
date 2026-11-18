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
- `POST /api/v1/inventory/products`
- `GET /api/v1/inventory/categories`
- `POST /api/v1/inventory/categories`
- `GET /api/v1/inventory/brands`
- `POST /api/v1/inventory/brands`

El `POST /products` es transaccional. Cada referencia puede enviarse como
`{ "id": "..." }` o `{ "name": "Nueva referencia" }`; con `name` se crea o
reactiva automáticamente.

## Pruebas

La validación pura está en `src/modules/inventory/services/product-input.service.ts`
y sus tests cubren producto válido, campos obligatorios, precio cero/negativo y
descripción vacía. Los tests del servicio cubren creación inline y conflicto por
código duplicado. La validación manual del flujo completo se ejecuta contra el
compose levantado.
