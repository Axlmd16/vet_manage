# user-registration-ui Specification

## Purpose

Pantalla de usuarios, formulario de registro de personal, avisos y acceso según permiso.

## Requirements

### Requirement: Users screen
The frontend SHALL provide at `/users` a users screen with the title "Usuarios" and, only for users with the permission `users:create`, a "Nuevo usuario" button that opens `/users/new`. The rest of the screen is reserved for the user list and, until it exists, SHALL show a notice that the list will be available soon. The screen SHALL require the permission `users:read`.

#### Scenario: Administrator opens users
- **WHEN** the Administrator opens "Usuarios" in the side menu
- **THEN** the users screen is shown with the "Nuevo usuario" button and the registration form is not shown

#### Scenario: User without create permission
- **WHEN** a user with `users:read` but without `users:create` opens `/users`
- **THEN** the screen is shown without the "Nuevo usuario" button

### Requirement: Staff registration screen
The frontend SHALL provide at `/users/new` a staff registration form with identification, first name, last name, email, optional phone and the list of assignable roles loaded from the API as checkboxes, a "Guardar" button, a "Cancelar" button and a link back to `/users`.

#### Scenario: Form loads the roles
- **WHEN** the Administrator presses "Nuevo usuario"
- **THEN** the form shows the staff roles returned by the API and no role is selected

#### Scenario: Cancel
- **WHEN** the Administrator presses "Cancelar"
- **THEN** the users screen is shown and nothing is saved

### Requirement: Client-side validation
The frontend SHALL NOT call the API when a required field is empty or no role is selected, showing the toast "Complete los campos obligatorios" and highlighting the missing fields; nor when the identification fails the Ecuadorian identification check, showing "La cédula debe tener 10 dígitos válidos", or the email has an invalid format, showing "Ingrese un correo electrónico válido", next to the field.

#### Scenario: Missing email and roles
- **WHEN** the Administrator leaves the email empty, selects no role and presses "Guardar"
- **THEN** no request is sent, the email field and the roles group are highlighted and the toast "Complete los campos obligatorios" is shown

#### Scenario: Short identification
- **WHEN** the Administrator types "11045" and presses "Guardar"
- **THEN** no request is sent and "La cédula debe tener 10 dígitos válidos" is shown under the field

### Requirement: Registration result
The frontend SHALL report the result with toasts shown at the bottom right of the screen. After a successful registration it SHALL return to `/users`: with a success toast "Usuario registrado correctamente" when the credentials were sent or none were needed, adding a note when an existing person was reused, or with a warning toast "Usuario registrado, pero no se pudo enviar el correo. Verifique la dirección y reenvíe las credenciales" when `passwordAssigned` is true and `credentialsSent` is false. When the API rejects the registration it SHALL stay on the form, show the API message in an error toast, keep the data typed and highlight the identification or email field for duplicated values.

#### Scenario: Successful registration
- **WHEN** the API registers the user and sends the credentials
- **THEN** the users screen is shown with the toast "Usuario registrado correctamente" at the bottom right

#### Scenario: Email not sent
- **WHEN** the API registers the user with `passwordAssigned` true and `credentialsSent` false
- **THEN** the users screen is shown with the warning toast "Usuario registrado, pero no se pudo enviar el correo. Verifique la dirección y reenvíe las credenciales"

#### Scenario: Duplicated identification
- **WHEN** the API responds "Número de cédula ya registrado"
- **THEN** the form stays open, the error toast is shown, the identification field is highlighted and the typed data is kept

### Requirement: Screens restricted by permission
The frontend SHALL show the users screen only to users with `users:read` and the registration form only to users with `users:create`; other authenticated users SHALL see "No tiene permisos para realizar esta acción" instead and the screen SHALL NOT be rendered. The side menu SHALL show an "Administración" section with the "Usuarios" link only to users with `users:read`.

#### Scenario: Receptionist opens the form
- **WHEN** a user with only the Recepcionista role opens `/users/new`
- **THEN** the message "No tiene permisos para realizar esta acción" is shown instead of the form

#### Scenario: Menu link
- **WHEN** the Administrator is logged in
- **THEN** the side menu shows "Usuarios" under "Administración", and a Recepcionista does not see it
