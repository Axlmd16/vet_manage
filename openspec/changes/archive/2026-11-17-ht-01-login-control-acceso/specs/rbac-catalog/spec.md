## ADDED Requirements

### Requirement: Permission catalog follows the roles and permissions matrix
The system SHALL declare one permission per function of the Módulo I matrix, using the key format `module:action`, and SHALL keep that catalog as the single source of permission definitions.

#### Scenario: Every matrix function has a permission
- **WHEN** the permission catalog is loaded
- **THEN** each function of the matrix has a declared permission key and no key is declared twice

#### Scenario: General functions have no permission
- **WHEN** the catalog is inspected for login, password recovery and password change
- **THEN** no permission is declared for them, because any authenticated user can use them

### Requirement: Role catalog defines the eight system roles
The system SHALL declare the roles Administrador, Gerente, Veterinario, Técnico Veterinario, Recepcionista, Cajero, Bodeguero and Cliente, and SHALL NOT declare a super administrator role.

#### Scenario: Roles are created on an empty database
- **WHEN** the synchronization runs on a database without roles
- **THEN** the eight roles exist, marked as system roles and active

#### Scenario: Initial grants match the matrix
- **WHEN** the synchronization runs on an empty database
- **THEN** each role holds exactly the permissions the matrix assigns to it
- **AND** Administrador holds user, role and audit permissions but no client or patient permissions
- **AND** Cajero, Bodeguero and Cliente hold no permissions

### Requirement: Synchronization only creates missing records
The system SHALL create missing permissions and roles at startup and SHALL NOT update, revoke or delete anything that already exists in the database, nor reactivate an inactive role.

#### Scenario: Restart keeps administrator changes
- **WHEN** an administrator adds a permission to a system role, removes another one and deactivates a different role, and the system restarts
- **THEN** the added permission is still granted, the removed permission is still not granted and the deactivated role is still inactive

#### Scenario: Permission declared again
- **WHEN** an inactive permission is declared again in the catalog and the system restarts
- **THEN** the permission becomes active again and its existing grants are kept

#### Scenario: Synchronization is idempotent
- **WHEN** the synchronization runs twice in a row
- **THEN** the second run creates nothing and changes nothing

### Requirement: Default grants are given only when the record is created
The system SHALL grant a permission to the roles that declare it only at the moment the permission or the role is created.

#### Scenario: New permission reaches the roles that declare it
- **WHEN** the catalog adds a permission declared by a role and the system restarts
- **THEN** the permission is created and granted to that role

#### Scenario: Removed grant is not restored
- **WHEN** an administrator removes a catalog permission from a role and the system restarts
- **THEN** the permission is not granted to that role again

### Requirement: Permissions removed from the catalog are deactivated
The system SHALL mark as inactive any active permission that is no longer declared in the catalog, preserving its record and its grants.

#### Scenario: Permission retired from the catalog
- **WHEN** the system starts and an active permission is not declared in the catalog
- **THEN** that permission becomes inactive and its record remains in the database

### Requirement: Strict synchronization mode for development
The system SHALL support a `strict` synchronization mode, selected with RBAC_SYNC_MODE, in which the catalog is authoritative for the system roles, and SHALL default to the create-only mode when the variable is not set.

#### Scenario: Strict mode restores the catalog
- **WHEN** the system starts in strict mode and a system role has an extra grant, a missing grant or is inactive
- **THEN** the extra grant is revoked, the missing grant is added and the role is active again

#### Scenario: Strict mode keeps custom roles
- **WHEN** the system starts in strict mode and a role that is not declared in the catalog has grants
- **THEN** that role and its grants are not modified

#### Scenario: Invalid mode
- **WHEN** RBAC_SYNC_MODE has a value other than create-only or strict
- **THEN** the system fails to start
