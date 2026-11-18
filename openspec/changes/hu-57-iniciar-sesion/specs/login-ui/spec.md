## ADDED Requirements

### Requirement: Login screen
The frontend SHALL show a login screen with email and password fields and an "Iniciar sesión" button. It SHALL NOT call the API when a field is empty and SHALL show "Ingrese su correo y contraseña"; otherwise it SHALL show the message returned by the API when the login fails.

#### Scenario: Empty fields
- **WHEN** the user presses "Iniciar sesión" with an empty field
- **THEN** no request is sent and the message "Ingrese su correo y contraseña" is shown

#### Scenario: Failed login
- **WHEN** the API rejects the login
- **THEN** the screen shows the API message and keeps the email typed

#### Scenario: Successful login
- **WHEN** the API accepts the login
- **THEN** the session is stored and the main screen is shown

### Requirement: Protected routes
The frontend SHALL redirect to the login screen any route of the application when there is no session, and SHALL end the session and return to the login screen when the API answers 401 to a request with the token.

#### Scenario: No session
- **WHEN** a visitor opens the main screen without a session
- **THEN** the login screen is shown

#### Scenario: Session expired
- **WHEN** a request with the stored token returns 401
- **THEN** the session is cleared and the login screen is shown

#### Scenario: Reload with session
- **WHEN** the user reloads the page with a valid stored token
- **THEN** the profile is loaded again and the main screen is shown without asking for credentials

### Requirement: Menu by permissions
The frontend SHALL show in the side menu only the sections whose read permission the user has, as the union of all the user's roles, and SHALL show the user's name and roles. Sections without an associated permission SHALL stay visible to every user.

#### Scenario: Veterinarian
- **WHEN** a user whose only role is Veterinario logs in
- **THEN** the menu shows the clinical sections the role can read and hides the ones it cannot

#### Scenario: Several roles
- **WHEN** a user has two roles with different read permissions
- **THEN** the menu shows the sections of both

### Requirement: Logout
The frontend SHALL offer a "Cerrar sesión" action that clears the stored session and shows the login screen.

#### Scenario: Logout
- **WHEN** the user presses "Cerrar sesión"
- **THEN** the token is removed and the login screen is shown
