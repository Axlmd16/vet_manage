#!/usr/bin/env bash
# Etapa 2 – Ejecuta las pruebas unitarias (Vitest ≈60 %) y de integración API (Supertest + Newman ≈25 %).
# Restaura Staging con pg_restore antes de cada suite de integración para partir siempre de la semilla.
# Uso: bash qa/sprint-1/run-unit-api.sh
# Sale con código distinto de 0 si alguna suite tiene fallas (las fallas son los defectos reportados).
set -uo pipefail
source "$(dirname "$0")/staging/scripts/common.sh"
set +e

RESULTS=()
run() { # run <nombre> <comando...>
  local name=$1; shift
  log "▶ $name"
  "$@"
  local code=$?
  RESULTS+=("$name: $([[ $code -eq 0 ]] && echo 'OK' || echo "con fallas (código $code)")")
}

cd "$ROOT/vet-manage-api" || exit 1
run "Unitarias API (Vitest + cobertura)" npx vitest run -c vitest.config.qa.ts --coverage
cd "$ROOT/vet-manage-frontend" || exit 1
run "Unitarias frontend (Vitest + jsdom)" npx vitest run -c vitest.config.qa.ts
cd "$ROOT/vet-manage-api" || exit 1

bash "$STAGING_DIR/scripts/restore-staging.sh"
run "Integración API (Supertest)" npx vitest run -c vitest.config.qa-api.ts

bash "$STAGING_DIR/scripts/restore-staging.sh"
cd "$ROOT/qa" || exit 1
mkdir -p sprint-1/reports/newman
run "Integración API (Newman)" npm run api:newman --silent

bash "$STAGING_DIR/scripts/restore-staging.sh"

log "Resumen:"
printf '  - %s\n' "${RESULTS[@]}"
printf '%s\n' "${RESULTS[@]}" | grep -q "con fallas" && exit 1 || exit 0
