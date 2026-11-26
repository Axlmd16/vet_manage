#!/usr/bin/env bash
# RODEO TEMPORAL SOLO PARA STAGING (defecto DEF-08).
# En una base nueva, `prisma migrate deploy` falla: 20261119222634_agendamiento_citas crea una clave
# foránea hacia "patients", tabla que recién existe tras 20261119230000_rename_pets_to_patients
# (posterior). Prisma no revierte la migración fallida, así que se parte de una base vacía y se
# aplican las migraciones con psql en el orden corregido, registrándolas en Prisma como aplicadas.
# Se elimina cuando el equipo corrija el orden de las migraciones.
# Uso: bash qa/staging/scripts/workaround-migration-order.sh   (BORRA la base de Staging)
source "$(dirname "$0")/common.sh"

BROKEN=20261119222634_agendamiento_citas
RENAME=20261119230000_rename_pets_to_patients
MIGRATIONS="$ROOT/vet-manage-api/prisma/migrations"

log "DEF-08: recreando la base de Staging y aplicando las migraciones en orden corregido…"
"${COMPOSE[@]}" stop api frontend >/dev/null 2>&1
psql_staging -q -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

ordered=()
for dir in $(ls "$MIGRATIONS" | grep -E '^[0-9]{14}_' | sort); do
  [[ $dir == "$RENAME" ]] && continue
  [[ $dir == "$BROKEN" ]] && ordered+=("$RENAME")
  ordered+=("$dir")
done

for name in "${ordered[@]}"; do
  psql_staging -q -v ON_ERROR_STOP=1 -f - < "$MIGRATIONS/$name/migration.sql" || { echo "Falló $name" >&2; exit 1; }
  "${COMPOSE[@]}" run --rm --no-deps -T api npx prisma migrate resolve --applied "$name" >/dev/null
  echo "  aplicada: $name"
done

"${COMPOSE[@]}" run --rm --no-deps -T api npx prisma migrate status | tail -2
"${COMPOSE[@]}" up -d api frontend
wait_for_url "$API_URL/health/ready" 120
wait_for_url "$WEB_URL" 240
log "Migraciones aplicadas con el rodeo; Staging listo."
