# initial-admin Specification

## Purpose

Creación del Administrador inicial a partir de la configuración del entorno.

## Requirements

### Requirement: Initial administrator is created from configuration
The system SHALL create an initial administrator at startup, from the environment variables ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_IDENTIFICATION, ADMIN_FIRST_NAME and ADMIN_LAST_NAME, when no user holds the Administrador role.

#### Scenario: First startup
- **WHEN** the system starts and no user has the Administrador role
- **THEN** it creates a person and an active user linked to it with the Administrador role and a hashed password, in a single transaction

#### Scenario: Administrator already exists
- **WHEN** the system starts and some user already has the Administrador role
- **THEN** it creates nothing, even if the configured email differs from the existing administrator

#### Scenario: Person already registered
- **WHEN** the system starts without administrators and a person with the configured identification already exists without an account
- **THEN** it creates the user for that person and does not duplicate the person

#### Scenario: Creation fails midway
- **WHEN** an error occurs while creating the administrator
- **THEN** neither the person nor the user is persisted

### Requirement: Administrator configuration is validated at startup
The system SHALL refuse to start when the administrator variables are missing or invalid.

#### Scenario: Missing variable
- **WHEN** any of the administrator variables is not set
- **THEN** the system fails to start with an error naming the variable

#### Scenario: Weak password
- **WHEN** ADMIN_PASSWORD has fewer than 8 characters or lacks an uppercase letter, a lowercase letter or a digit
- **THEN** the system fails to start

#### Scenario: Invalid identification
- **WHEN** ADMIN_IDENTIFICATION does not have exactly 10 digits
- **THEN** the system fails to start

### Requirement: Initial administrator can authenticate
The system SHALL store the administrator password so that it can be verified against the configured value.

#### Scenario: Password verification
- **WHEN** the configured password is verified against the stored hash
- **THEN** the verification succeeds, and any other password fails
