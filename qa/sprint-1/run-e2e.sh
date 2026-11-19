#!/usr/bin/env bash
# Etapa 3 – Pruebas E2E (Playwright) y de aceptación (Cucumber.js) contra Staging (≈10 % de la pirámide).
# Cada suite restaura la base con pg_restore antes de empezar (globalSetup / BeforeAll).
# Uso: bash qa/sprint-1/run-e2e.sh
set -uo pipefail
source "$(dirname "$0")/staging/scripts/common.sh"
set +e

cd "$ROOT/qa" || exit 1
mkdir -p sprint-1/reports/e2e/evidencias

log "▶ E2E con Playwright"
npx playwright test -c sprint-1/e2e/playwright.config.ts
playwright=$?

log "▶ Aceptación con Cucumber.js (Gherkin)"
npx cucumber-js -c sprint-1/e2e/cucumber.cjs
cucumber=$?

bash "$STAGING_DIR/scripts/restore-staging.sh"

log "Resumen: Playwright $([[ $playwright -eq 0 ]] && echo OK || echo 'con fallas') · Cucumber $([[ $cucumber -eq 0 ]] && echo OK || echo 'con fallas')"
log "Reportes: qa/sprint-1/reports/playwright-html/index.html · qa/sprint-1/reports/e2e/cucumber-report.html"
[[ $playwright -eq 0 && $cucumber -eq 0 ]]
