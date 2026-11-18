## ADDED Requirements

### Requirement: Passwords are stored as salted hashes
The system SHALL store passwords only as salted scrypt hashes and SHALL verify them in constant time.

#### Scenario: Hash differs from the password
- **WHEN** a password is hashed
- **THEN** the result does not contain the plain password
- **AND** hashing the same password twice produces different results

#### Scenario: Verification
- **WHEN** a password is verified against its hash
- **THEN** the correct password succeeds and a different one fails

### Requirement: Password format policy
The system SHALL accept only passwords with at least 8 characters, one uppercase letter, one lowercase letter and one digit.

#### Scenario: Valid password
- **WHEN** the password "Vet12345" is checked
- **THEN** it is accepted

#### Scenario: Invalid password
- **WHEN** the password "vet12345" or "Vet1" is checked
- **THEN** it is rejected

### Requirement: Session tokens expire
The system SHALL issue signed JWT tokens that identify the user and expire after the configured time, 15 minutes by default, and SHALL reject tokens that are invalid, tampered with or expired.

#### Scenario: Valid token
- **WHEN** a token is issued for a user and validated before it expires
- **THEN** validation returns the user identifier

#### Scenario: Expired token
- **WHEN** a token is validated after its expiration time
- **THEN** validation fails

#### Scenario: Tampered token
- **WHEN** a token signed with another secret or with an altered payload is validated
- **THEN** validation fails

#### Scenario: Missing secret
- **WHEN** JWT_SECRET is not set or is shorter than 32 characters
- **THEN** the system fails to start

### Requirement: Authentication guard checks every request
The system SHALL reject with 401 any request to a protected route that has no token, an invalid token or an expired token, and SHALL verify on every request that the user exists and is active.

#### Scenario: No token
- **WHEN** a request without an Authorization header reaches a protected route
- **THEN** the response is 401 with the standard error envelope

#### Scenario: Expired token
- **WHEN** a request carries an expired token
- **THEN** the response is 401

#### Scenario: Inactive account
- **WHEN** a request carries a valid token of a user whose status is not active
- **THEN** the response is 401

#### Scenario: Deleted user
- **WHEN** a request carries a valid token of a user that no longer exists
- **THEN** the response is 401

### Requirement: Permission guard checks current permissions
The system SHALL reject with 403 a request whose user lacks any permission required by the route, resolving permissions from the database on each request as the union of the permissions of all the user's active, non-expired roles.

#### Scenario: User without the permission
- **WHEN** an authenticated user without the required permission calls the route
- **THEN** the response is 403

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

### Requirement: Guards are reusable by other domains
The system SHALL expose the authentication guard, the permission guard and a `@RequirePermissions` decorator from the identity module, without registering them globally.

#### Scenario: Public routes stay public
- **WHEN** a route does not use the decorator
- **THEN** it does not require a token
