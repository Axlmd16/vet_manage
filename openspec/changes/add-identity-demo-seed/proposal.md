# Seed demo de Inventory

## Por qué

El entorno local puede arrancar con el esquema vacío, pero el equipo necesita
categorías, marcas y productos de ejemplo para validar el catálogo y el flujo
de registro de entradas de inventario.

## Qué cambia

- Crear `vet-manage-api/seed/inventory.seed.ts` como seed exclusivo de
  Inventory.
- Crear categorías, marcas y productos demo de forma idempotente usando sus
  claves únicas.
- Agregar `seed/index.ts` como entrypoint para separar futuros seeds por módulo.
- Agregar comandos `make up-seed` y `make up-podman-seed`.
- Documentar datos cargados y cómo repetir el seed sin duplicar registros.

## No incluye

No crea personas, usuarios, roles, permisos, mascotas, clientes ni citas.
Tampoco implementa login, JWT o autorización.

## Criterios de éxito

- Un levantamiento con seed deja datos demo de Inventory disponibles.
- Repetir el comando no crea filas duplicadas ni productos repetidos.
- Los cambios de los datos declarativos se actualizan al volver a ejecutar.
- `make up-podman` normal continúa sin ejecutar datos demo.
