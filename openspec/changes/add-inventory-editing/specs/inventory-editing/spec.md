## ADDED Requirements

### Requirement: Edit catalog references

The system MUST allow an existing active category or brand to be updated while
preserving unique names and returning the updated record.

#### Scenario: Update a category successfully
- **GIVEN** an existing category with name `Alimentos`
- **WHEN** the user saves the category with name `Nutrición` and a description
- **THEN** the response is successful
- **AND** the category list contains `Nutrición` with the new description

#### Scenario: Reject a duplicated category name
- **GIVEN** another category already has the name `Farmacia`
- **WHEN** the user renames a category to `Farmacia`
- **THEN** the system rejects the update with a conflict
- **AND** the original category name remains unchanged

#### Scenario: Update a brand successfully
- **GIVEN** an existing brand with name `Dog Chow`
- **WHEN** the user saves the brand with name `Royal Canin`
- **THEN** the response is successful
- **AND** the brand list contains `Royal Canin`

#### Scenario: Reject an empty catalog name
- **GIVEN** an existing category or brand
- **WHEN** the user saves it with an empty name
- **THEN** the system rejects the update as invalid
- **AND** no catalog record is changed

### Requirement: Edit products

The system MUST allow an existing product to be loaded and updated with valid
catalog references, a unique code, required fields, and a price greater than
zero.

#### Scenario: Load a product for editing
- **GIVEN** an existing active product
- **WHEN** the user opens its edit screen
- **THEN** the response contains its code, name, description, price, category,
  and brand

#### Scenario: Update a product successfully
- **GIVEN** an existing product with code `PR-001`
- **WHEN** the user changes its name, description, category, brand and price
  to `30.00` and saves
- **THEN** the product is updated with all submitted values
- **AND** the catalog displays the new values

#### Scenario: Allow an empty product description
- **GIVEN** an existing product with a description
- **WHEN** the user clears only the description and saves valid required fields
- **THEN** the product is updated with no description

#### Scenario: Reject a non-positive product price
- **GIVEN** an existing product with valid required fields
- **WHEN** the user saves it with price `0` or a negative price
- **THEN** the system rejects the update
- **AND** the message is `El precio unitario debe ser mayor que cero`

#### Scenario: Reject a duplicated product code
- **GIVEN** another product already has code `PR-002`
- **WHEN** the user changes the current product code to `PR-002`
- **THEN** the system rejects the update with a conflict
- **AND** the current product remains unchanged

#### Scenario: Reject a missing product
- **GIVEN** the requested product ID does not exist
- **WHEN** the user opens or saves that product
- **THEN** the system responds that the product was not found

### Requirement: Communicate editing results in the interface

The frontend MUST expose edit actions and communicate successful and failed
updates through the shared toast component.

#### Scenario: Finish a catalog edit
- **GIVEN** the user is editing a category or brand
- **WHEN** the update succeeds
- **THEN** the inline editor closes
- **AND** a success toast is displayed

#### Scenario: Show an editing failure
- **GIVEN** the user is editing a product or catalog reference
- **WHEN** the API rejects the update
- **THEN** the form remains available for correction
- **AND** an error toast is displayed
