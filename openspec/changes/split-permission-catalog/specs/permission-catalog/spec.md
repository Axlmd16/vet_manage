## ADDED Requirements

### Requirement: Modular permission declarations

The backend MUST declare permissions in module-specific files and expose one
aggregated collection to the RBAC synchronizer.

#### Scenario: Aggregate permissions from modules
- **GIVEN** Identity, clinical and inventory permission files
- **WHEN** the application imports the public permissions catalog
- **THEN** it receives all declared permissions in one flat collection
- **AND** each permission retains its module and action key

#### Scenario: Keep the public contract stable
- **GIVEN** existing roles and guards import `PermissionKey` or `PERMISSIONS`
- **WHEN** the catalog is split into files
- **THEN** those imports continue to compile
- **AND** the synchronizer receives the same collection shape

### Requirement: Validate the combined catalog

The permission catalog MUST reject duplicate keys and malformed module-action
keys through automated tests.

#### Scenario: Detect duplicate keys
- **GIVEN** permissions from all module files are combined
- **WHEN** the catalog test checks their keys
- **THEN** every key is unique

#### Scenario: Validate key format
- **GIVEN** the combined permission collection
- **WHEN** its keys are checked
- **THEN** every key follows `module:action` using lowercase letters and hyphens

### Requirement: Preserve RBAC synchronization

The synchronizer MUST continue to create, update, reactivate and deactivate
permissions using the aggregated catalog.

#### Scenario: Synchronize a modular catalog
- **GIVEN** the backend starts with the modular permission files
- **WHEN** RBAC synchronization runs
- **THEN** all aggregated permissions are persisted once
- **AND** roles only reference declared permission keys
