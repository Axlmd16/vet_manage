# Validación de criterios de entrada CE-01 a CE-03

- Fecha: 19/11/2026 17:26
- Rama: `test/sprint-1-qa` @ `4aa7b87`
- Ambiente: Staging local (`vet-manage-staging`) · API http://localhost:3180/api/v1 · Web http://localhost:5184

| Criterio | Verificación | Resultado | Evidencia |
| --- | --- | --- | --- |
| CE-01 | HU-51 documentada con criterios Gherkin | ✅ Cumple | 9 escenarios, 9 bloques Gherkin |
| CE-01 | HU-54 documentada con criterios Gherkin | ✅ Cumple | 8 escenarios, 8 bloques Gherkin |
| CE-01 | HU-57 documentada con criterios Gherkin | ✅ Cumple | 9 escenarios, 9 bloques Gherkin |
| CE-01 | HU-01 documentada con criterios Gherkin | ✅ Cumple | 5 escenarios, 5 bloques Gherkin |
| CE-01 | HU-07 documentada con criterios Gherkin | ✅ Cumple | 9 escenarios, 9 bloques Gherkin |
| CE-01 | HU-13 documentada con criterios Gherkin | ✅ Cumple | 4 escenarios, 4 bloques Gherkin |
| CE-02 | PR HU-51 integrado | ✅ Cumple | origin/feature/modulo1/HU-51-registrar-usuario integrada en development |
| CE-02 | PR HU-54 integrado | ✅ Cumple | origin/feature/modulo1/HU-54-asignar-y-quitar-roles-usuario integrada en development |
| CE-02 | PR HU-57 integrado | ✅ Cumple | origin/feature/modulo1/HU-57-iniciar-sesion integrada en development |
| CE-02 | PR HU-01 integrado | ✅ Cumple | origin/feature/modulo1/HU-01-regisrar-cliente integrada en development |
| CE-02 | PR HU-07 integrado | ✅ Cumple | origin/feature/modulo1/HU-07-registrar-paciente integrada en development |
| CE-02 | PR HU-13 integrado | ✅ Cumple | origin/feature/modulo1/HU-13-registrar-especie integrada en development |
| CE-02 | Endpoint HU-51 desplegado | ✅ Cumple | POST /users → HTTP 401 |
| CE-02 | Endpoint HU-54 desplegado | ✅ Cumple | PUT /users/00000000-0000-4000-8000-000000000000/role-assignment → HTTP 401 |
| CE-02 | Endpoint HU-01 desplegado | ✅ Cumple | POST /clients → HTTP 401 |
| CE-02 | Endpoint HU-07 desplegado | ✅ Cumple | POST /pets → HTTP 401 |
| CE-02 | Endpoint HU-13 desplegado | ✅ Cumple | POST /pets/species → HTTP 401 |
| CE-02 | Endpoint HU-57 desplegado (login sin blockers) | ✅ Cumple | POST /auth/login (qa.admin) → HTTP 200 |
| CE-03 | API Staging lista (PostgreSQL, Redis, RabbitMQ) | ✅ Cumple | {"status":"ready","dependencies":{"postgres":"up","redis":"up","rabbitmq":"up"},"timestamp":"2026-11-19T22:26:17.983Z"} |
| CE-03 | Conexión directa a la BD PostgreSQL de Staging | ✅ Cumple | PostgreSQL 17.12 · vet_manage_staging |
| CE-03 | Datos semilla cargados (8 roles QA) | ✅ Cumple | 8 roles con usuario QA |
| CE-03 | Respaldo pg_dump disponible para pg_restore | ✅ Cumple | 56.0K /qa-backups/qa-seed.dump |
| CE-03 | Frontend Staging disponible | ✅ Cumple | HTTP 200 |
| CE-03 | Mailpit (captura de correos) disponible | ✅ Cumple | HTTP 200 |
| CE-03 | Pipeline CI definido (GitHub Actions) | ✅ Cumple | C:/VetManage/vet_manage/.github/workflows/qa-sprint-1.yml |
| CE-03 | Vitest (runner compatible con Jest) instalado | ✅ Cumple | vitest/4.1.12 win32-x64 node-v24.16.0 |
| CE-03 | Supertest instalado | ✅ Cumple | supertest 7.3.1 |
| CE-03 | Newman instalado | ✅ Cumple | 6.2.3 |
| CE-03 | Playwright instalado | ✅ Cumple | Version 1.65.1 |
| CE-03 | Cucumber.js instalado | ✅ Cumple | This Node.js version (v24.16.0) has not been tested with this version of Cucumber; it should work normally, but please raise an issue if you see anything unexpected. |

**Resultado global: se cumplen CE-01, CE-02 y CE-03.**
