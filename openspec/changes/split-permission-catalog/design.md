# Diseño

```text
src/config/permissions/
├── identity.permissions.ts
├── clinical.permissions.ts
└── inventory.permissions.ts

src/config/permissions.catalog.ts  # agregador y API pública
```

Cada archivo exporta `readonly PermissionDefinition[]` de un solo módulo. El
agregador importa esas listas y expone `PERMISSIONS = catalogs.flat()` junto
con los tipos `PermissionDefinition` y `PermissionKey` para no romper imports
existentes.

`PermissionKey` conserva el formato `${string}:${string}`. La prueba de
catálogos valida la unicidad global, por lo que dos módulos no pueden declarar
la misma clave accidentalmente.
