## MODIFIED Requirements

### Requirement: Permission guard checks current permissions
The system SHALL reject with 403 and the message "No tiene permisos para realizar esta acción" a request whose user lacks any permission required by the route, resolving permissions from the database on each request as the union of the permissions of all the user's active, non-expired roles.

#### Scenario: User without the permission
- **WHEN** an authenticated user without the required permission calls the route
- **THEN** the response is 403 with the message "No tiene permisos para realizar esta acción"

#### Scenario: User with the permission
- **WHEN** an authenticated user with the required permission calls the route
- **THEN** the request proceeds

#### Scenario: Permissions of several roles are added
- **WHEN** a user has two roles and each one grants a different required permission
- **THEN** the request proceeds

#### Scenario: Inactive role or permission
- **WHEN** the only grant of the permission comes from an inactive role, an expired role assignment or an inactive permission
- **THEN** the response is 403

#### Scenario: Permission change applies immediately
- **WHEN** an administrator removes a permission from a role while a user holds a valid token
- **THEN** the next request of that user to a route requiring it returns 403 without restarting the system
