#!/usr/bin/env bash
# Valida los criterios de entrada CE-01 a CE-03 del plan de pruebas y deja la evidencia en
# qa/staging/reports/ce-validation.md.
# Uso: bash qa/staging/scripts/validate-ce.sh
source "$(dirname "$0")/common.sh"
set +e

REPORT="$ROOT/qa/staging/reports/ce-validation.md"
mkdir -p "$(dirname "$REPORT")"
HU_DIR="$ROOT/docs/modulo-1-historial-clinico/historias-usuario"
FAILS=0
ROWS=()

check() { # check <criterio> <descripción> <comando...>
  local ce=$1 desc=$2; shift 2
  local out
  if out=$("$@" 2>&1); then
    ROWS+=("| $ce | $desc | ✅ Cumple | ${out//$'\n'/ · } |")
  else
    ROWS+=("| $ce | $desc | ❌ No cumple | ${out//$'\n'/ · } |")
    FAILS=$((FAILS + 1))
  fi
}

# ── CE-01: HU documentadas con criterios Gherkin ──
hu_scenarios() { # hu_scenarios <archivo> <HU>
  local n
  n=$(awk -v hu="## $2 " 'index($0, hu)==1{on=1; next} /^## HU-/{on=0} on && /^#### Escenario/{c++} END{print c+0}' "$HU_DIR/$1")
  local gherkin
  gherkin=$(awk -v hu="## $2 " 'index($0, hu)==1{on=1; next} /^## HU-/{on=0} on && /^```gherkin/{c++} END{print c+0}' "$HU_DIR/$1")
  echo "$n escenarios, $gherkin bloques Gherkin"
  [[ $n -gt 0 && $n -eq $gherkin ]]
}
check CE-01 "HU-51 documentada con criterios Gherkin" hu_scenarios 08-autenticacion-usuarios.md HU-51
check CE-01 "HU-54 documentada con criterios Gherkin" hu_scenarios 08-autenticacion-usuarios.md HU-54
check CE-01 "HU-57 documentada con criterios Gherkin" hu_scenarios 08-autenticacion-usuarios.md HU-57
check CE-01 "HU-01 documentada con criterios Gherkin" hu_scenarios 01-clientes.md HU-01
check CE-01 "HU-07 documentada con criterios Gherkin" hu_scenarios 02-pacientes.md HU-07
check CE-01 "HU-13 documentada con criterios Gherkin" hu_scenarios 03-especies-razas.md HU-13

# ── CE-02: funcionalidad integrada (PR aprobados en development) y desplegada en Staging ──
git -C "$ROOT" fetch -q origin development 2>/dev/null
merged() { # merged <rama remota>
  git -C "$ROOT" fetch -q origin "$1" 2>/dev/null
  if git -C "$ROOT" merge-base --is-ancestor "origin/$1" origin/development; then echo "origin/$1 integrada en development"; else echo "origin/$1 NO integrada"; return 1; fi
}
check CE-02 "PR HU-51 integrado" merged feature/modulo1/HU-51-registrar-usuario
check CE-02 "PR HU-54 integrado" merged feature/modulo1/HU-54-asignar-y-quitar-roles-usuario
check CE-02 "PR HU-57 integrado" merged feature/modulo1/HU-57-iniciar-sesion
check CE-02 "PR HU-01 integrado" merged feature/modulo1/HU-01-regisrar-cliente
check CE-02 "PR HU-07 integrado" merged feature/modulo1/HU-07-registrar-paciente
check CE-02 "PR HU-13 integrado" merged feature/modulo1/HU-13-registrar-especie

deployed() { # deployed <método> <ruta>: la ruta existe si responde 401 (pide sesión) y no 404
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' -X "$1" -H 'content-type: application/json' -d '{}' "$API_URL$2")
  echo "$1 $2 → HTTP $code"
  [[ $code == 401 ]]
}
check CE-02 "Endpoint HU-51 desplegado" deployed POST /users
check CE-02 "Endpoint HU-54 desplegado" deployed PUT /users/00000000-0000-4000-8000-000000000000/role-assignment
check CE-02 "Endpoint HU-01 desplegado" deployed POST /clients
check CE-02 "Endpoint HU-07 desplegado" deployed POST /pets
check CE-02 "Endpoint HU-13 desplegado" deployed POST /pets/species
login_ok() {
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' -X POST -H 'content-type: application/json' \
    -d '{"email":"qa.admin@vetmanage.test","password":"QaVet2026"}' "$API_URL/auth/login")
  echo "POST /auth/login (qa.admin) → HTTP $code"
  [[ $code == 200 ]]
}
check CE-02 "Endpoint HU-57 desplegado (login sin blockers)" login_ok

# ── CE-03: ambiente y herramientas operativas ──
check CE-03 "API Staging lista (PostgreSQL, Redis, RabbitMQ)" curl -fsS "$API_URL/health/ready"
check CE-03 "Conexión directa a la BD PostgreSQL de Staging" psql_staging -tAc "SELECT 'PostgreSQL ' || current_setting('server_version') || ' · ' || current_database()"
check CE-03 "Datos semilla cargados (8 roles QA)" psql_staging -tAc "SELECT count(DISTINCT r.name) || ' roles con usuario QA' FROM users u JOIN persons p ON p.id=u.person_id JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE p.email LIKE 'qa.%@vetmanage.test' HAVING count(DISTINCT r.name) = 8"
check CE-03 "Respaldo pg_dump disponible para pg_restore" "${COMPOSE[@]}" exec -T postgres sh -c "ls -lh $SEED_DUMP | awk '{print \$5, \$9}'"
check CE-03 "Frontend Staging disponible" curl -fsS -o /dev/null -w 'HTTP %{http_code}' "$WEB_URL"
check CE-03 "Mailpit (captura de correos) disponible" curl -fsS -o /dev/null -w 'HTTP %{http_code}' http://localhost:59025
check CE-03 "Pipeline CI definido (GitHub Actions)" ls "$ROOT/.github/workflows/qa.yml"
tool() { (cd "$ROOT/$1" && npx --no-install "${@:2}" 2>/dev/null | tail -1); }
check CE-03 "Vitest (runner compatible con Jest) instalado" tool vet-manage-api vitest --version
check CE-03 "Supertest instalado" bash -c "cd '$ROOT/vet-manage-api' && node -p \"'supertest ' + require('./node_modules/supertest/package.json').version\""
check CE-03 "Newman instalado" tool qa newman --version
check CE-03 "Playwright instalado" tool qa playwright --version
check CE-03 "Cucumber.js instalado" tool qa cucumber-js --version

{
  echo "# Validación de criterios de entrada CE-01 a CE-03"
  echo
  echo "- Fecha: $(date '+%d/%m/%Y %H:%M')"
  echo "- Rama: \`$(git -C "$ROOT" branch --show-current)\` @ \`$(git -C "$ROOT" rev-parse --short HEAD)\`"
  echo "- Ambiente: Staging local (\`vet-manage-staging\`) · API $API_URL · Web $WEB_URL"
  echo
  echo "| Criterio | Verificación | Resultado | Evidencia |"
  echo "| --- | --- | --- | --- |"
  printf '%s\n' "${ROWS[@]}"
  echo
  if [[ $FAILS -eq 0 ]]; then echo "**Resultado global: se cumplen CE-01, CE-02 y CE-03.**"; else echo "**Resultado global: $FAILS verificaciones no se cumplen.**"; fi
} > "$REPORT"

log "Reporte: $REPORT ($FAILS verificaciones fallidas)"
exit "$FAILS"
