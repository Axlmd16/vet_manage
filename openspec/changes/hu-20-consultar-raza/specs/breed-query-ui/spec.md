## ADDED Requirements

### Requirement: Search breeds by name
`BreedsPage` SHALL show a search field «Buscar raza por nombre». The list SHALL update with the breeds that match, without distinguishing case or accents, after the user stops typing for 300 ms, and SHALL return to the full list when the field is cleared.

#### Scenario: Search by name
- **WHEN** the Veterinarian types "labra" in the search field
- **THEN** the table shows only the breeds whose name contains "labra"

#### Scenario: Clear the search
- **WHEN** the user clears the search field
- **THEN** the table shows all the breeds again

### Requirement: Filter breeds by species
`BreedsPage` SHALL show a species filter with the option «Todas las especies» and every registered species, active or inactive. Selecting a species SHALL show only its breeds; the filter SHALL combine with the name search.

#### Scenario: Filter by species
- **WHEN** the Receptionist selects "Felino"
- **THEN** the table shows only breeds of Felino

#### Scenario: Search and filter combined
- **WHEN** the user selects "Canino" and types "mestizo"
- **THEN** the table shows only "Mestizo" of Canino

### Requirement: No results message
When no breed matches the search or the filter, `BreedsPage` SHALL show «No se encontraron razas con el criterio ingresado» instead of the table.

#### Scenario: No breeds found
- **WHEN** the user types "xyz"
- **THEN** the page shows «No se encontraron razas con el criterio ingresado»

### Requirement: Breed details in read-only mode
Selecting a breed in the results SHALL open a read-only panel with its name, associated species, description (or «Sin descripción») and status («Activa» or «Inactiva»). The edit action (HU-18) SHALL remain visible only to users with `breeds:update`.

#### Scenario: View a breed
- **WHEN** the Veterinary Technician selects "Siamés"
- **THEN** the panel shows the name "Siamés", the species "Felino", its description and the status «Activa», without editing controls

### Requirement: Access by permission
The breeds page SHALL be available to users with `breeds:read` (Manager, Veterinarian, Veterinary Technician and Receptionist) and SHALL show the no-permission notice to other roles.

#### Scenario: Cashier opens the breeds page
- **WHEN** a Cashier opens the catalog of breeds
- **THEN** the page shows «No tiene permisos para realizar esta acción» and no breed data
