# user-login Specification

## Purpose

Inicio de sesión con correo y contraseña, mensajes al usuario, bloqueo por intentos fallidos y sesiones renovables.

## Requirements

### Requirement: Login with email and password
The system SHALL expose a public `POST /auth/login` endpoint that receives an email and a password and, when both are correct and the account is active and not locked, returns a signed access token, the user's names and email, the user's roles, the union of the permissions of the user's active roles and the `mustChangePassword` flag. The email SHALL be compared without regard to case or surrounding spaces.

#### Scenario: Successful login
- **WHEN** an active user sends the correct email and password
- **THEN** the response is 200 with an access token, the user data, the roles, the permissions and `mustChangePassword`

#### Scenario: User with several roles
- **WHEN** a user with the roles Gerente and Administrador logs in
- **THEN** the response lists both roles and the permissions of both

#### Scenario: Email with different case
- **WHEN** the user writes the registered email in upper case or with surrounding spaces
- **THEN** the login succeeds

#### Scenario: Temporary password
- **WHEN** a user whose password must be changed logs in successfully
- **THEN** the response has `mustChangePassword` set to true

### Requirement: Missing credentials are rejected
The system SHALL reject with 400 and the message "Ingrese su correo y contraseña" a login request whose email or password is missing or blank, without looking up the account or counting a failed attempt.

#### Scenario: Empty password
- **WHEN** the login request has an email and an empty password
- **THEN** the response is 400 with the message "Ingrese su correo y contraseña"

#### Scenario: Missing email
- **WHEN** the login request has no email
- **THEN** the response is 400 with the message "Ingrese su correo y contraseña"

### Requirement: Email format is validated
The system SHALL reject with 400 and the message "Ingrese un correo electrónico válido" a login whose email does not have a valid format, without looking up the account or counting a failed attempt.

#### Scenario: Malformed email
- **WHEN** the login request has the email "correo-invalido"
- **THEN** the response is 400 with the message "Ingrese un correo electrónico válido"

### Requirement: Invalid credentials do not reveal which field failed
The system SHALL reject with 401 a login with an unregistered email, a wrong password or an account without password, with the message "Correo o contraseña incorrectos" followed by the number of attempts left before the lock. Unregistered emails SHALL receive the same attempt count and lock as a registered account, so the response does not reveal whether the account exists.

#### Scenario: Wrong password
- **WHEN** a registered user without previous failures sends a wrong password
- **THEN** the response is 401 with the message "Correo o contraseña incorrectos. Le quedan 4 intentos antes de que la cuenta se bloquee"

#### Scenario: Last attempt
- **WHEN** a user with three consecutive failures fails again
- **THEN** the message ends with "Le queda 1 intento antes de que la cuenta se bloquee"

#### Scenario: Unregistered email
- **WHEN** the email does not belong to any user
- **THEN** the response is 401 with the same message a registered account would get, and the fifth attempt returns the lock message

### Requirement: Account is locked after five consecutive failures
The system SHALL count consecutive failed logins of an account and, on the fifth, SHALL lock it for 15 minutes and respond with 423 and the message "Cuenta bloqueada temporalmente. Intente en 15 minutos". While the lock lasts, every login attempt SHALL be rejected with 423 and the remaining minutes rounded up, even with the correct password, and SHALL NOT extend the lock. When the lock expires the account SHALL accept logins again with the counter at zero.

#### Scenario: Fifth failed attempt
- **WHEN** a user with four consecutive failed attempts fails again
- **THEN** the response is 423 with the message "Cuenta bloqueada temporalmente. Intente en 15 minutos"

#### Scenario: Attempt during the lock
- **WHEN** the account was locked 5 minutes ago and the user sends the correct password
- **THEN** the response is 423 with the message "Cuenta bloqueada temporalmente. Intente en 10 minutos"

#### Scenario: Lock expired
- **WHEN** the account was locked more than 15 minutes ago and the user sends the correct password
- **THEN** the login succeeds and the account is no longer locked

### Requirement: Successful login resets the counter
The system SHALL reset the failed attempts counter to zero when the user logs in successfully.

#### Scenario: Success after three failures
- **WHEN** a user with three failed attempts logs in correctly
- **THEN** the login succeeds and the counter is zero

### Requirement: Inactive or deactivated accounts cannot log in
The system SHALL reject with 403 and the message "Su cuenta se encuentra desactivada. Contacte al administrador" a login with correct credentials of an account whose status is inactive or deactivated. With a wrong password the response SHALL be the invalid credentials one.

#### Scenario: Inactive account
- **WHEN** a user with status inactive sends the correct email and password
- **THEN** the response is 403 with the message "Su cuenta se encuentra desactivada. Contacte al administrador"

#### Scenario: Deactivated account
- **WHEN** a user with status deactivated sends the correct email and password
- **THEN** the response is 403 with the same message

### Requirement: Current session profile
The system SHALL expose `GET /auth/me`, protected by the authentication guard, that returns the same user data, roles, permissions and `mustChangePassword` flag as the login, read from the database on each request.

#### Scenario: Valid session
- **WHEN** an active user calls the endpoint with a valid token
- **THEN** the response is 200 with the current profile

#### Scenario: Without token
- **WHEN** the endpoint is called without a token
- **THEN** the response is 401

### Requirement: Renewable sessions
The system SHALL open a session on each successful login, identified by a random refresh token stored only as a hash and sent in an `httpOnly` cookie restricted to the authentication routes. `POST /auth/refresh` SHALL exchange a valid refresh token for a new one and a new access token with the current profile, revoking the previous one. The session SHALL last `SESSION_EXPIRES_IN`, 12 hours by default. `POST /auth/logout` SHALL revoke the session and clear the cookie.

#### Scenario: Refresh token in a cookie
- **WHEN** the login succeeds
- **THEN** the response sets an `httpOnly` cookie with the refresh token and the body does not include it

#### Scenario: Renewal
- **WHEN** the client calls `POST /auth/refresh` with a valid cookie
- **THEN** the response is 200 with a new access token and the previous refresh token is revoked

#### Scenario: Reused token
- **WHEN** a refresh token that was already exchanged is sent again
- **THEN** the response is 401 with the message "La sesión expiró. Inicie sesión nuevamente"

#### Scenario: Expired session or disabled account
- **WHEN** the session expired or the account is no longer active
- **THEN** the renewal is rejected with 401

#### Scenario: Logout
- **WHEN** the client calls `POST /auth/logout`
- **THEN** the session is revoked and a later renewal with the same cookie returns 401
