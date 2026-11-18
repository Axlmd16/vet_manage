## ADDED Requirements

### Requirement: Registro de producto válido

El sistema MUST permitir registrar un producto con código, nombre, categoría,
marca y precio unitario válido, y MUST mostrarlo en el catálogo después de
guardarlo.

#### Scenario: Registrar un producto con datos válidos
- **GIVEN** el usuario se encuentra en la pantalla de registro de productos
- **WHEN** ingresa código `PR-001`, nombre `Alimento para perro`, descripción
  `Alimento seco para perros adultos`, categoría `Alimentos`, marca `Dog Chow`
  y precio unitario `25.50`, y confirma el registro
- **THEN** el sistema guarda el producto con todos los datos ingresados
- **AND** muestra `Producto registrado correctamente`
- **AND** el producto aparece en el catálogo

#### Scenario: Crear categoría y marca durante el registro
- **GIVEN** la categoría `Alimentos` y la marca `Dog Chow` no existen
- **WHEN** el usuario las crea desde el formulario y confirma el producto
- **THEN** el sistema crea ambas referencias y el producto en una operación
  consistente
- **AND** selecciona las referencias creadas en el producto

### Requirement: Validación de campos obligatorios

El sistema MUST impedir el registro cuando falte código, nombre, categoría,
marca o precio unitario, y MUST identificar cada campo pendiente.

#### Scenario: Impedir el registro cuando falta un dato obligatorio
- **GIVEN** el usuario se encuentra en la pantalla de registro de productos
- **WHEN** deja vacío uno o más campos obligatorios y confirma el registro
- **THEN** el sistema no registra el producto
- **AND** muestra un error junto a cada campo pendiente

### Requirement: Validación del precio

El sistema MUST aceptar únicamente precios unitarios mayores que cero.

#### Scenario: Impedir el registro con precio cero
- **GIVEN** el usuario completó los demás campos obligatorios
- **WHEN** ingresa precio unitario `0` y confirma el registro
- **THEN** el sistema no registra el producto
- **AND** muestra `El precio unitario debe ser mayor que cero`

#### Scenario: Impedir el registro con precio negativo
- **GIVEN** el usuario completó los demás campos obligatorios
- **WHEN** ingresa precio unitario `-5` y confirma el registro
- **THEN** el sistema no registra el producto
- **AND** muestra `El precio unitario debe ser mayor que cero`

### Requirement: Código de producto único

El sistema MUST impedir que dos productos activos compartan el mismo código.

#### Scenario: Impedir el registro de un código duplicado
- **GIVEN** existe un producto registrado con código `PR-001`
- **WHEN** el usuario intenta registrar otro producto con código `PR-001`
- **THEN** el sistema no registra el nuevo producto
- **AND** muestra `El código del producto ya está registrado`

### Requirement: Descripción opcional

El sistema MUST permitir guardar un producto sin descripción cuando los demás
campos obligatorios sean válidos.

#### Scenario: Guardar producto sin descripción
- **GIVEN** el usuario completó nombre, categoría, marca y precio válido
- **WHEN** deja vacía la descripción y confirma el registro
- **THEN** el sistema guarda el producto con descripción vacía
- **AND** muestra `Producto registrado correctamente`
