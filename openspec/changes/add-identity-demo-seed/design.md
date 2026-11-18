# Diseño del seed de Inventory

## Estructura

```text
vet-manage-api/seed/
├── index.ts             # entrypoint y lifecycle de Prisma
└── inventory.seed.ts    # única responsabilidad: categorías, marcas y productos
```

El entrypoint no conoce otros módulos. En el futuro se podrán agregar
`identity.seed.ts` u otros archivos y componerlos explícitamente, sin mezclar
datos.

## Idempotencia

- Categorías: `upsert` por `name`.
- Marcas: `upsert` por `name`.
- Productos: `upsert` por `code`.
- Las relaciones de producto se resuelven por los nombres naturales de la
  categoría y marca.
- La descripción vacía se normaliza a `null` y el precio se escribe como
  decimal.

Todas las operaciones se ejecutan en una transacción. Repetir el seed actualiza
los datos declarativos y no crea duplicados.

## Comandos

- `make up-podman`: infraestructura y aplicaciones, sin seed.
- `make up-podman-seed`: infraestructura, migraciones, aplicaciones y seed.
- `make up-seed`: equivalente usando Docker Compose.

El seed se ejecuta después de que el API esté levantado y las migraciones hayan
terminado, usando un contenedor efímero con la misma imagen y red del API.
