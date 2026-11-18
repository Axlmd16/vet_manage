## 1. Configuración y dependencias

- [x] 1.1 Agregar `@nestjs/jwt` a `vet-manage-api/package.json` y verificar que `npm install` en el contenedor termina sin errores
- [x] 1.2 Agregar `JWT_SECRET`, `JWT_EXPIRES_IN` y `ADMIN_*` a `env.validation.ts` y `configuration.ts`; la API no arranca si falta alguna obligatoria o es inválida
- [x] 1.3 Agregar las variables a `.env.example` y a `docker-compose.yml` con valores de desarrollo; `docker compose up` arranca sin editar `.env`

## 2. Catálogos

- [x] 2.1 Reemplazar `permissions.catalog.ts` con las claves del diseño, una por fila de la matriz; una prueba comprueba que no hay claves repetidas y que todas siguen `modulo:accion`
- [x] 2.2 Reemplazar `roles.catalog.ts` con los 8 roles y sus permisos según la matriz, sin `super_admin`; una prueba comprueba los permisos de Administrador, Recepcionista, Técnico Veterinario, Cajero, Bodeguero y Cliente

## 3. Sincronizador

- [x] 3.1 Reescribir `RbacCatalogSynchronizer` para que solo cree permisos y roles faltantes y marque inactivos los permisos retirados
- [x] 3.2 Conceder las asignaciones por defecto solo a permisos o roles creados en esa ejecución
- [x] 3.3 Pruebas unitarias: primera ejecución crea todo, segunda ejecución no cambia nada, un permiso agregado o quitado por el Administrador sobrevive, un rol desactivado sigue inactivo y un permiso nuevo del catálogo llega a los roles que lo declaran

- [x] 3.4 Agregar el modo `strict` (variable `RBAC_SYNC_MODE`, `strict` por defecto en Docker Compose) con pruebas de reposición de asignaciones y de roles personalizados intactos

## 4. Contraseñas

- [x] 4.1 Crear `PasswordHasher` con `scrypt`, sal aleatoria, formato versionado y comparación en tiempo constante
- [x] 4.2 Agregar la validación de formato (8 caracteres, mayúscula, minúscula y número) y reutilizarla en `env.validation.ts`
- [x] 4.3 Pruebas unitarias: el hash no contiene la contraseña, dos hashes de la misma contraseña difieren, verifica la correcta y rechaza otra, valida los formatos

## 5. Administrador inicial

- [x] 5.1 Crear `InitialAdminService`: si no hay usuario con rol administrador, crea persona (o reutiliza la de la misma cédula), usuario activo y asignación de rol en una transacción
- [x] 5.2 Ejecutarlo después del sincronizador, con el orden garantizado en `IdentityModule`
- [x] 5.3 Prueba e2e: se crea, no se duplica al repetir, no se crea si ya hay otro administrador, reutiliza una persona existente y la contraseña verifica

## 6. Token y guards

- [x] 6.1 Crear `TokenService` sobre `@nestjs/jwt` con secreto y expiración configurables
- [x] 6.2 Crear `JwtAuthGuard`: 401 sin token, inválido, vencido, usuario inexistente o no activo
- [x] 6.3 Crear `PermissionsGuard` y el decorador `@RequirePermissions` que aplica ambos guards; 403 sin permiso
- [x] 6.4 Resolver los permisos del usuario en cada petición: asignaciones sin vencer, rol activo y permiso activo, sumando los roles
- [x] 6.5 Exportar guards, decorador y servicios desde `IdentityModule`
- [x] 6.6 Pruebas unitarias de `TokenService`: token válido, vencido, firmado con otro secreto y alterado

## 7. Pruebas e2e de acceso

- [x] 7.1 Controlador de prueba solo en el módulo de test con una ruta que requiere un permiso
- [x] 7.2 Casos: sin token 401, token vencido 401, usuario inactivo 401, usuario sin permiso 403, con permiso 200, permisos de dos roles se suman, rol inactivo da 403
- [x] 7.3 Caso: quitar un permiso del rol hace que la siguiente petición con el mismo token devuelva 403
- [x] 7.4 Caso: reiniciar el sincronizador no revierte un cambio de permisos hecho por el Administrador

## 8. Documentación y cierre

- [x] 8.1 Actualizar `vet-manage-api/docs/identity-rbac.md` con el nuevo comportamiento del sincronizador, las variables y el uso de `@RequirePermissions`
- [x] 8.2 Ejecutar `tsc`, las pruebas unitarias y las e2e de `test/identity` en el contenedor y confirmar que pasan
- [x] 8.3 Confirmar con una base limpia que la API arranca, crea los 8 roles y el Administrador inicial
