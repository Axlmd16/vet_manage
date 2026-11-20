#!/usr/bin/env bash
# Despliega el ambiente Staging (build de imágenes, migraciones y arranque).
# Uso: bash qa/sprint-1/staging/scripts/deploy-staging.sh
source "$(dirname "$0")/common.sh"

log "Construyendo y levantando Staging (proyecto vet-manage-staging)…"
mkdir -p "$STAGING_DIR/backups"
"${COMPOSE[@]}" up -d --build || true

# DEF-08: si la API no arranca por el orden de las migraciones, se aplica el rodeo temporal.
if "${COMPOSE[@]}" logs api 2>/dev/null | grep -q "20261119222634_agendamiento_citas"; then
  bash "$STAGING_DIR/scripts/workaround-migration-order.sh"
fi

log "Esperando a la API (migraciones + arranque)…"
wait_for_url "$API_URL/health/ready" 120

log "Esperando al frontend (vite build + preview)…"
wait_for_url "$WEB_URL" 120

"${COMPOSE[@]}" ps
log "Staging listo: API $API_URL · Web $WEB_URL · Mailpit http://localhost:59025"
