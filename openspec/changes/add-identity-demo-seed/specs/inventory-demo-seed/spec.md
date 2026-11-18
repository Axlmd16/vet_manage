## ADDED Requirements

### Requirement: Seed demo de Inventory

The Inventory seed MUST create coherent demo categories, brands and products
using the existing catalog schema and product relationships.

#### Scenario: Seed an empty database
- **GIVEN** the database has applied the Inventory migration and contains no
  demo catalog records
- **WHEN** the developer runs the seed command
- **THEN** demo categories and brands are created
- **AND** demo products are created with valid category and brand relations

#### Scenario: Preserve product relationships
- **GIVEN** the Inventory seed is executed successfully
- **WHEN** a demo product is queried with its category and brand
- **THEN** both relations exist and are active
- **AND** the product has a positive unit price

### Requirement: Idempotent Inventory seed execution

The seed MUST be safe to execute repeatedly without duplicating categories,
brands or products.

#### Scenario: Run the seed twice
- **GIVEN** the Inventory seed has already run once
- **WHEN** the developer runs it again
- **THEN** the command succeeds
- **AND** the number of demo categories, brands and products remains unchanged

#### Scenario: Update declarative demo data
- **GIVEN** a demo product already exists with stale editable data
- **WHEN** the seed runs after the demo definition changes
- **THEN** the product data is updated by its unique code
- **AND** no duplicate product is created

### Requirement: Separate module seed execution

The seed entrypoint MUST execute Inventory data only and MUST NOT create
Identity or other business-module records.

#### Scenario: Seed does not populate Identity
- **GIVEN** the database has Identity tables available
- **WHEN** the Inventory seed is executed
- **THEN** persons, users, roles and permissions remain unchanged

#### Scenario: Seed through Compose
- **GIVEN** the developer chooses the Docker or Podman seed target
- **WHEN** the target completes
- **THEN** migrations and application dependencies are healthy
- **AND** the Inventory seed has completed against the same database
