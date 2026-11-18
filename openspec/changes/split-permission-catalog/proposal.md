# Separación del catálogo de permisos

## Por qué

`src/config/permissions.catalog.ts` crecerá rápidamente si contiene todos los
dominios del sistema. Además, existen archivos parciales dentro de
`src/config/permissions` que no están integrados al sincronizador.

## Qué cambia

- Separar permisos declarativos por módulo dentro de `src/config/permissions/`.
- Mantener `permissions.catalog.ts` como agregador pequeño y contrato público.
- Corregir la referencia rota a `PERMISSION_ENTRIES`.
- Eliminar copias no utilizadas para evitar fuentes de verdad duplicadas.
- Añadir pruebas para unicidad, formato y cobertura de permisos usados por los
  roles.

## No cambia

No cambia el esquema Prisma, la sincronización de base de datos, los roles ni
los nombres de permisos existentes. La edición de un archivo seguirá
sincronizándose al reiniciar el backend.

## Criterios de éxito

- Cada módulo puede declarar sus permisos en un archivo independiente.
- `PERMISSIONS` conserva una única colección plana para el sincronizador.
- No existen claves duplicadas y todas respetan `modulo:accion`.
- El backend compila y las pruebas RBAC continúan pasando.
