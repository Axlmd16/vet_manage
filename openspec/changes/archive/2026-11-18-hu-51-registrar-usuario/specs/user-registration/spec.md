## ADDED Requirements

### Requirement: Register a staff user
The system SHALL expose `POST /users`, protected with the permission `users:create`, that receives an identification number, first name, last name, email, an optional phone and one or more staff role names. When the data is valid and the identification is not registered, it SHALL create the person, an account in status `ACTIVE` with a system-generated temporary password and `mustChangePassword` set to true, and one role assignment per selected role recording the administrator who assigned it, all in a single transaction. It SHALL respond 201 with the message "Usuario registrado correctamente" and the created user with its roles, without the password.

#### Scenario: Registration with one role
- **WHEN** the Administrator sends a valid identification, names, email and phone with the role `veterinarian`
- **THEN** the response is 201 with "Usuario registrado correctamente", the account is `ACTIVE`, has the role Veterinario, has a hashed password and `mustChangePassword` is true

#### Scenario: Registration with several roles
- **WHEN** the Administrator registers a user with the roles `manager` and `administrator`
- **THEN** a single account is created with both roles assigned

#### Scenario: Phone omitted
- **WHEN** the request has no phone
- **THEN** the user is registered and the person has no phone

#### Scenario: Password is not exposed
- **WHEN** a user is registered
- **THEN** neither the response nor the logs contain the temporary password or its hash

### Requirement: Temporary password
The system SHALL generate the temporary password with a cryptographically secure generator, with 12 characters including at least one uppercase letter, one lowercase letter and one digit, so it satisfies the password policy. Only its hash SHALL be stored.

#### Scenario: Password complies with the policy
- **WHEN** a temporary password is generated
- **THEN** it has 12 characters and satisfies the password policy

#### Scenario: Passwords are not repeated
- **WHEN** two users are registered
- **THEN** each one receives a different temporary password

### Requirement: Existing person is reused
The system SHALL identify the person by the identification number. When the person already exists and does not have any active staff role, it SHALL NOT create another person: it SHALL keep the stored person data, create the account if the person has none, and add the selected roles to the account. An existing account SHALL keep its password and status; only an account without password SHALL receive a temporary password. The response SHALL indicate that an existing person was reused.

#### Scenario: Person is already a client with an account
- **WHEN** "Ana Ruiz" has an account with only the Cliente role and the Administrator registers her identification with the role `cashier`
- **THEN** no person is duplicated, her account has the roles Cliente and Cajero, her password is unchanged and no credentials email is sent

#### Scenario: Person exists without an account
- **WHEN** the identification belongs to a person without an account
- **THEN** an account with a temporary password is created for that person and the credentials are sent to the person's stored email

### Requirement: Required fields
The system SHALL reject with 400, code `USER_MISSING_FIELDS` and the message "Complete los campos obligatorios" a request whose identification, first name, last name or email is missing or blank, or whose role list is missing or empty, listing the missing fields in `errors`, and SHALL NOT create anything.

#### Scenario: Empty email
- **WHEN** the request has a blank email
- **THEN** the response is 400 with "Complete los campos obligatorios" and `errors` includes `email`

#### Scenario: No role selected
- **WHEN** the request has an empty role list
- **THEN** the response is 400 with "Complete los campos obligatorios" and `errors` includes `roles`

### Requirement: Identification number format
The system SHALL accept only Ecuadorian identification numbers: 10 digits, a province code from 01 to 24 or 30, a third digit lower than 6 and a valid modulo 10 check digit. Otherwise it SHALL reject with 400, code `USER_INVALID_IDENTIFICATION` and the message "La cédula debe tener 10 dígitos válidos".

#### Scenario: Too short
- **WHEN** the identification is "11045"
- **THEN** the response is 400 with "La cédula debe tener 10 dígitos válidos"

#### Scenario: Wrong check digit
- **WHEN** the identification has 10 digits but its check digit does not match
- **THEN** the response is 400 with "La cédula debe tener 10 dígitos válidos"

#### Scenario: Valid identification
- **WHEN** the identification is "1700000001"
- **THEN** it passes the format validation

### Requirement: Field formats
The system SHALL reject with 400 an email without a valid format with code `USER_INVALID_EMAIL` and the message "Ingrese un correo electrónico válido", a phone that is not 7 to 15 digits with an optional leading "+" with code `USER_INVALID_PHONE` and the message "Ingrese un teléfono válido", and names longer than 100 characters with code `USER_INVALID_NAME` and the message "Los nombres y apellidos no pueden superar 100 caracteres". The email SHALL be stored trimmed and in lower case, and the names trimmed.

#### Scenario: Invalid email
- **WHEN** the email is "ana@"
- **THEN** the response is 400 with "Ingrese un correo electrónico válido"

#### Scenario: Invalid phone
- **WHEN** the phone is "12ab"
- **THEN** the response is 400 with "Ingrese un teléfono válido"

### Requirement: Only staff roles can be assigned
The system SHALL accept only the names of existing, active roles of the staff category. Otherwise it SHALL reject with 400, code `USER_INVALID_ROLES` and the message "Seleccione roles válidos del personal". Repeated role names SHALL be assigned once.

#### Scenario: Client role
- **WHEN** the role list contains `client`
- **THEN** the response is 400 with "Seleccione roles válidos del personal"

#### Scenario: Unknown role
- **WHEN** the role list contains a name that does not exist
- **THEN** the response is 400 with "Seleccione roles válidos del personal"

### Requirement: List assignable roles
The system SHALL expose `GET /users/assignable-roles`, protected with `users:create`, that returns the name, display name and description of the active staff roles ordered by display name.

#### Scenario: Roles for the form
- **WHEN** the Administrator requests the assignable roles
- **THEN** the response lists the staff roles and does not include Cliente

### Requirement: Identification already registered as staff
The system SHALL reject with 409, code `USER_IDENTIFICATION_TAKEN` and the message "Número de cédula ya registrado" a registration whose identification belongs to a person whose account has at least one active staff role.

#### Scenario: Duplicated staff identification
- **WHEN** a staff user with the identification "1700000001" exists and the Administrator registers another user with it
- **THEN** the response is 409 with "Número de cédula ya registrado" and nothing changes

### Requirement: Email already registered
The system SHALL reject with 409, code `USER_EMAIL_TAKEN` and the message "El correo ya se encuentra registrado" a registration of a new person whose email, compared without regard to case, belongs to another person.

#### Scenario: Duplicated email
- **WHEN** the email "mlopez@vetmanage.com" belongs to another person and the Administrator registers a new user with "MLopez@vetmanage.com"
- **THEN** the response is 409 with "El correo ya se encuentra registrado" and nothing is created

#### Scenario: Concurrent registration
- **WHEN** two registrations with the same identification or email are committed at the same time
- **THEN** one succeeds and the other responds 409 with the corresponding message

### Requirement: Credentials are sent by email
After the registration is committed, when the account received a temporary password, the system SHALL send to the person's email the welcome message with the subject "Su cuenta de VetManage está lista", showing the person's name, the login email, the temporary password, the display names of the assigned roles, a link to the login screen built from `APP_URL` and the instruction to change the password at first login. The response SHALL include `passwordAssigned` indicating whether the account received a temporary password and `credentialsSent` indicating whether the email was sent.

#### Scenario: Email sent
- **WHEN** a user is registered and the mail server accepts the message
- **THEN** the person's email receives the welcome message with the credentials, the roles and the login link, and `credentialsSent` is true

### Requirement: Email failure keeps the account
When sending the credentials fails, the system SHALL keep the account created, log a warning without the password, and respond 201 with `credentialsSent` false and the message "Usuario registrado, pero no se pudo enviar el correo. Verifique la dirección y reenvíe las credenciales".

#### Scenario: Mail server unavailable
- **WHEN** the mail server rejects the message or does not respond
- **THEN** the account exists, the response is 201 with `credentialsSent` false and the message "Usuario registrado, pero no se pudo enviar el correo. Verifique la dirección y reenvíe las credenciales"

### Requirement: Registration requires permission
The system SHALL reject with 401 a registration request without a valid session and with 403 and the message "No tiene permisos para realizar esta acción" one from a user without `users:create`.

#### Scenario: Receptionist
- **WHEN** a user with only the Recepcionista role calls `POST /users`
- **THEN** the response is 403 with "No tiene permisos para realizar esta acción"

#### Scenario: No session
- **WHEN** `POST /users` is called without a token
- **THEN** the response is 401
