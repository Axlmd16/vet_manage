# Etapa 3 – Pruebas funcionales E2E (Playwright / Cucumber.js)

Cronograma del Sprint 1, día 3: *Ejecución de pruebas funcionales E2E (Playwright / Cucumber.js 10 %) sobre login, bloqueo al 5.º intento fallido, asignación de roles, auditoría y registro de clientes/pacientes.* Entregable: [matriz de errores](05-matriz-errores.md).

Fecha de ejecución: 19/11/2026 · Ambiente: Staging local (http://localhost:5184) · Navegador: Chromium (Playwright) · Rama `test/sprint-1-qa`.

## 1. Herramientas y organización

| Herramienta | Uso | Ubicación |
| --- | --- | --- |
| **Playwright** | Flujos E2E en el navegador con selectores accesibles (etiquetas, roles, textos) | [`qa/sprint-1/e2e/tests/`](../../../../qa/sprint-1/e2e/tests/) |
| **Cucumber.js** | Escenarios de aceptación en Gherkin **en español**, tomados de los criterios de las HU, ejecutados con Playwright | [`qa/sprint-1/e2e/features/`](../../../../qa/sprint-1/e2e/features/) |

Antes de cada suite la base se restaura con `pg_restore` (globalSetup de Playwright y `BeforeAll` de Cucumber), así las pruebas parten siempre de la [semilla](02-datos-semilla.md).

```bash
bash qa/sprint-1/run-e2e.sh            # Playwright + Cucumber
cd qa && npm run e2e:playwright        # solo Playwright
cd qa && npm run e2e:cucumber          # solo Cucumber
```

Reportes: `qa/sprint-1/reports/playwright-html/index.html` (con capturas, video y traza de cada falla), [`qa/sprint-1/reports/e2e/cucumber-report.html`](../../../../qa/sprint-1/reports/e2e/cucumber-report.html) y capturas de evidencia en [`qa/sprint-1/reports/e2e/evidencias/`](../../../../qa/sprint-1/reports/e2e/evidencias/).

## 2. Resultados de Playwright (21 pruebas: 17 pasan, 4 fallan)

| Área del cronograma | Caso | Resultado |
| --- | --- | --- |
| Login | CP-57-01 El Veterinario inicia sesión y ve sus funciones (sin "Usuarios") | ✅ |
| Login | CP-57-03 Contraseña incorrecta → mensaje genérico | ✅ |
| Login | CP-57-04 Campos vacíos → "Ingrese su correo y contraseña" sin llamar a la API | ✅ |
| **Bloqueo al 5.º intento** | CP-57-05/06 4.º intento avisa "Le queda 1 intento"; el 5.º bloquea 15 min; con la contraseña correcta sigue bloqueada | ✅ |
| Login | CP-57-09 Contraseña temporal lleva al cambio obligatorio | ❌ DEF-06 |
| Registro de usuarios | CP-51-01 El Administrador registra un Veterinario y llega el correo (Mailpit) | ✅ |
| Registro de usuarios | CP-51-05 Correo vacío resaltado con "Complete los campos obligatorios" | ✅ |
| Registro de usuarios | CP-51-14 El Recepcionista no puede abrir el registro de personal | ✅ |
| **Asignación de roles** | CP-54-07 El rol ya asignado no aparece como opción | ✅ |
| **Asignación de roles** | CP-54-01 Asigna Cajero a Carlos Pérez; al iniciar sesión tiene ambos roles | ✅ |
| **Asignación de roles** | CP-54-04 No permite dejar al usuario sin roles | ✅ |
| **Auditoría** | CP-51-18 / CP-54-14 El Administrador consulta la auditoría del alta y del cambio de roles | ❌ DEF-05 |
| **Registro de clientes** | CP-01-01 Registro exitoso con "Cliente registrado exitosamente" | ❌ DEF-04 (muestra "correctamente") |
| **Registro de clientes** | CP-01-04 Obligatorios vacíos con el mensaje de la HU | ❌ DEF-04 |
| **Registro de clientes** | CP-01-14 El Cajero no puede registrar clientes | ✅ |
| **Registro de pacientes** | CP-07-01 / CP-07-16 Registro con selector de cliente; no hay campo de código editable | ✅ |
| **Registro de pacientes** | CP-07-04 Sin cliente → "Debe seleccionar un cliente registrado" | ✅ |
| **Registro de pacientes** | CP-07-05 Un cliente dado de baja no aparece en el selector | ✅ |
| Especies | CP-13-01 El Veterinario registra una especie | ✅ |
| Especies | CP-13-02 Nombre obligatorio | ✅ |
| Especies | CP-13-05 Cancelar no guarda | ✅ |

## 3. Resultados de Cucumber.js (9 escenarios: 8 pasan, 1 falla)

| Feature | Escenario (de la HU) | Resultado |
| --- | --- | --- |
| `hu-57-iniciar-sesion.feature` | Esc. 1 Inicio de sesión exitoso | ✅ |
| `hu-57-iniciar-sesion.feature` | Esc. 5 Bloqueo por intentos fallidos | ✅ |
| `hu-51-registrar-usuario.feature` | Esc. 1 Registro exitoso con un rol (estado, rol y correo verificados) | ✅ |
| `hu-51-registrar-usuario.feature` | Esc. 9 Usuario sin permiso | ✅ |
| `hu-54-asignar-roles.feature` | Esc. 1 Asignar un rol adicional | ✅ |
| `hu-01-registrar-cliente.feature` | Esc. 1 Registro exitoso de un cliente | ❌ DEF-04 (el cliente se guarda ACTIVE, pero el mensaje no es el de la HU) |
| `hu-07-registrar-paciente.feature` | Esc. 1 Registro exitoso (estado ACTIVE y código PAC-######) | ✅ |
| `hu-13-registrar-especie.feature` | Esc. 1 Registro exitoso | ✅ |
| `hu-13-registrar-especie.feature` | Esc. 4 Cancelación del registro | ✅ |

## 4. Ajustes a las pruebas durante la ejecución

Se registran para que quede claro qué fue un error de la prueba y qué fue un defecto del sistema:

| Prueba | Problema de la prueba | Ajuste |
| --- | --- | --- |
| CP-13-01 / CP-13-05 | Verificaban la especie en el listado, pero el listado de especies es un marcador "disponible próximamente" (HU-16, fuera del sprint); CP-13-05 pasaba sin comprobar nada | Se verifica el catálogo por la API (`GET /pets/species/active`) |
| CP-54-04 | Tomaba las casillas antes de que la pantalla terminara de cargar | Espera a que se muestren los roles y hace clic en la tarjeta visible |
| CP-07-05 | Podía pasar antes de que llegara la respuesta de la búsqueda (retardo del selector) | Espera la respuesta de `/clients?search=Vivanco` |
| Cucumber | Una sola `Característica` por archivo; esperar el fin del login antes de navegar | Un archivo `.feature` por HU; paso `signIn` que espera la redirección |

## 5. Observaciones (no son defectos; se consultan al PO)

| # | Observación | Sugerencia |
| --- | --- | --- |
| OBS-01 | HU-07 dice que el **Veterinario** registra pacientes, pero la matriz de roles (2.3) le pone "—". El sistema se lo permite. | Unificar HU y matriz. |
| OBS-02 | Las cédulas de ejemplo de las HU (1104567890, 1105555555) no pasan el dígito verificador, así que no se pueden usar tal cual en pruebas. | Actualizar los ejemplos de las HU. |
| OBS-03 | El listado de clientes solo muestra personas con cuenta de rol *Cliente*; un cliente sin cuenta (por ejemplo, cargado por SQL o migración) no aparece en la búsqueda ni en el selector de pacientes. | Tenerlo en cuenta en futuras migraciones de datos. |
| OBS-04 | La HU-07 Esc. 8 pide mostrar el código en la ficha del paciente; la ficha llega con HU-12 (consulta), fuera de este alcance. El código sí se genera y se devuelve. | Verificar en el sprint de HU-12. |

## 6. Resumen de la etapa

- **Bloqueo al 5.º intento, login y asignación de roles** funcionan de punta a punta.
- **Registro de pacientes** cumple, incluido el código automático y que no se ofrezcan clientes dados de baja.
- **Registro de clientes** falla en los mensajes de la HU (DEF-04), además de los defectos de reglas detectados en la Etapa 2 (DEF-01 a DEF-03).
- **Auditoría** no existe (DEF-05) y el **cambio obligatorio de contraseña temporal** no está implementado (DEF-06).
