#!/usr/bin/env bash
# Restaura la base de Staging al estado de la semilla con pg_restore y mide el tiempo (OC-06: ≤ 30 min).
# Se ejecuta antes de cada corrida de pruebas para que los datos sean deterministas.
# Uso: bash qa/sprint-1/staging/scripts/restore-staging.sh
source "$(dirname "$0")/common.sh"

start=$(date +%s)
log "Restaurando $SEED_DUMP con pg_restore --clean…"
"${COMPOSE[@]}" exec -T postgres pg_restore -U "$DB_USER" -d "$DB_NAME" -p "$DB_PORT" \
  --clean --if-exists --no-owner --single-transaction "$SEED_DUMP"

# Los contadores de intentos de correos no registrados y la caché de permisos viven en Redis.
"${COMPOSE[@]}" exec -T redis redis-cli -p 57379 FLUSHALL >/dev/null

elapsed=$(( $(date +%s) - start ))
users=$(psql_staging -tAc "SELECT count(*) FROM users")
pets=$(psql_staging -tAc "SELECT count(*) FROM patients")
log "Restauración completa en ${elapsed}s (usuarios: $users, pacientes: $pets)."
