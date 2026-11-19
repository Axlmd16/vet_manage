#!/usr/bin/env bash
# Carga los datos semilla y genera el respaldo "dorado" con pg_dump.
#   1. Seed de la aplicación (roles demo, especies, razas, inventario).
#   2. Semilla QA (qa-seed.sql: 8 roles, clientes, pacientes).
#   3. pg_dump -Fc → backups/qa-seed.dump (se restaura antes de cada corrida de pruebas).
# Uso: bash qa/sprint-1/staging/scripts/seed-staging.sh
source "$(dirname "$0")/common.sh"

log "Regenerando qa-seed.sql desde qa-seed.data.json…"
node "$STAGING_DIR/seed/build-seed-sql.mjs"

log "Ejecutando el seed de la aplicación dentro del contenedor de la API…"
"${COMPOSE[@]}" exec -T api npm run seed

log "Cargando la semilla QA en PostgreSQL…"
psql_staging -q -f /qa-seed/qa-seed.sql

log "Conteo de registros cargados:"
psql_staging -c "
SELECT 'usuarios' AS tabla, count(*) FROM users
UNION ALL SELECT 'roles asignados', count(*) FROM user_roles
UNION ALL SELECT 'clientes', count(*) FROM clients
UNION ALL SELECT 'pacientes', count(*) FROM pets
UNION ALL SELECT 'especies', count(*) FROM species
UNION ALL SELECT 'razas', count(*) FROM breeds;"

log "Respaldo con pg_dump (formato custom) → $SEED_DUMP"
"${COMPOSE[@]}" exec -T postgres pg_dump -U "$DB_USER" -d "$DB_NAME" -p "$DB_PORT" -Fc -f "$SEED_DUMP"
"${COMPOSE[@]}" exec -T postgres pg_restore --list "$SEED_DUMP" | grep -c "TABLE DATA" | xargs -I{} echo "  tablas con datos en el respaldo: {}"
log "Semilla cargada y respaldada."
