# mail-delivery Specification

## Purpose

Envío de correos por SMTP, plantillas de los mensajes y servidor de correo local para desarrollo.

## Requirements

### Requirement: SMTP mail service
The system SHALL provide a reusable mail service that sends a message with recipient, subject, plain text and HTML body through the SMTP server configured by `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD` and the sender `MAIL_FROM`. Authentication SHALL be used only when `SMTP_USER` is set. A failed or timed out delivery SHALL be reported to the caller as an error.

#### Scenario: Message delivered
- **WHEN** a module sends a message and the SMTP server accepts it
- **THEN** the message reaches the server with the configured sender

#### Scenario: Server unavailable
- **WHEN** the SMTP server does not accept connections or does not answer within the timeout
- **THEN** the send operation fails with an error that the caller can handle

### Requirement: Mail configuration is validated
The system SHALL validate the mail variables at startup: `SMTP_PORT` a positive integer, `SMTP_SECURE` a boolean and `MAIL_FROM` a sender address; all of them SHALL have development defaults that point to the local mail catcher.

#### Scenario: Invalid port
- **WHEN** the API starts with `SMTP_PORT=abc`
- **THEN** the startup fails with a configuration error

#### Scenario: Defaults
- **WHEN** the API starts without mail variables
- **THEN** it uses the local mail catcher host and port and the default sender

### Requirement: Branded email templates
The system SHALL build the messages it sends from a shared layout (header with the VetManage name, content area and automatic-message footer) with inline styles and no external images, and SHALL provide both an HTML and a plain-text version. Every dynamic value inserted in the HTML SHALL be escaped.

#### Scenario: Escaped values
- **WHEN** a message is rendered with a name that contains HTML characters
- **THEN** the HTML shows them escaped and does not contain the original markup

#### Scenario: Plain-text version
- **WHEN** a welcome message is rendered
- **THEN** its plain-text version contains the same login email, password and link as the HTML

### Requirement: Local mail catcher
The development environment SHALL include a mail catcher service in `docker-compose.yml` that receives the messages sent by the API and shows them in a web interface, published on non-default host ports.

#### Scenario: Read a sent message
- **WHEN** the API sends a message in the Docker environment
- **THEN** the message is visible in the mail catcher web interface
