# login-ui Specification

## Purpose

Pantalla de inicio de sesión, protección de rutas, cierre de sesión y menú según permisos.

## Requirements

### Requirement: Login screen
The frontend SHALL show a login screen with email and password fields and an "Iniciar sesión" button. It SHALL NOT call the API when a field is empty, showing "Ingrese su correo y contraseña", or when the email has an invalid format, showing "Ingrese un correo electrónico válido" next to the field; otherwise it SHALL show the message returned by the API when the login fails, highlighting the attempts left and the lock.

#### Scenario: Empty fields
- **WHEN** the user presses "Iniciar sesión" with an empty field
- **THEN** no request is sent and the message "Ingrese su correo y contraseña" is shown

#### Scenario: Invalid email format
- **WHEN** the user types "ana@clinica" and leaves the field or presses "Iniciar sesión"
- **THEN** no request is sent and the message "Ingrese un correo electrónico válido" is shown under the field

#### Scenario: Attempts left
- **WHEN** the API rejects the credentials and reports the attempts left
- **THEN** the screen shows the message as a warning

#### Scenario: Failed login
- **WHEN** the API rejects the login
- **THEN** the screen shows the API message and keeps the email typed

#### Scenario: Successful login
- **WHEN** the API accepts the login
- **THEN** the session is stored and the main screen is shown

### Requirement: Protected routes
The frontend SHALL keep the access token only in memory and SHALL redirect to the login screen any route of the application when there is no session. When the API answers 401 to a request with the token, the frontend SHALL renew the session once and repeat the request; if the renewal fails it SHALL end the session and return to the login screen.

#### Scenario: No session
- **WHEN** a visitor opens the main screen without a session
- **THEN** the login screen is shown

#### Scenario: Access token expired
- **WHEN** a request returns 401 because the access token expired and the session is still valid
- **THEN** the session is renewed and the request is repeated without the user noticing

#### Scenario: Session expired
- **WHEN** a request returns 401 and the renewal also fails
- **THEN** the session is cleared and the login screen is shown

#### Scenario: Reload with session
- **WHEN** the user reloads the page while the session is valid
- **THEN** the session is renewed and the main screen is shown without asking for credentials

### Requirement: Menu by permissions
The frontend SHALL show in the side menu only the sections whose read permission the user has, as the union of all the user's roles, and SHALL show the user's name and roles. Sections without an associated permission SHALL stay visible to every user.

#### Scenario: Veterinarian
- **WHEN** a user whose only role is Veterinario logs in
- **THEN** the menu shows the clinical sections the role can read and hides the ones it cannot

#### Scenario: Several roles
- **WHEN** a user has two roles with different read permissions
- **THEN** the menu shows the sections of both

### Requirement: Logout
The frontend SHALL offer a "Cerrar sesión" action that revokes the session in the API, clears the access token and shows the login screen.

#### Scenario: Logout
- **WHEN** the user presses "Cerrar sesión"
- **THEN** the session is revoked, the token is removed and the login screen is shown
