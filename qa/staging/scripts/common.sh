#!/usr/bin/env bash
# Variables y funciones comunes de los scripts de Staging.
set -euo pipefail

# Git Bash en Windows convierte rutas como /qa-seed a C:/...; se desactiva para docker exec.
export MSYS_NO_PATHCONV=1

# En Git Bash, `pwd -W` da la ruta de Windows (C:/...), que docker entiende sin conversión.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && (pwd -W 2>/dev/null || pwd))"
STAGING_DIR="$ROOT/qa/staging"
COMPOSE=(docker compose -f "$STAGING_DIR/docker-compose.staging.yml")

DB_USER=vetmanage
DB_NAME=vet_manage_staging
DB_PORT=56432
API_URL=http://localhost:3180/api/v1
WEB_URL=http://localhost:5184
SEED_DUMP=/qa-backups/qa-seed.dump

log() { printf '\033[1;34m[staging]\033[0m %s\n' "$*"; }

psql_staging() {
  "${COMPOSE[@]}" exec -T postgres psql -v ON_ERROR_STOP=1 -U "$DB_USER" -d "$DB_NAME" -p "$DB_PORT" "$@"
}

wait_for_url() {
  local url=$1 tries=${2:-90}
  for ((i = 1; i <= tries; i++)); do
    if curl -fsS -o /dev/null "$url"; then return 0; fi
    sleep 2
  done
  echo "No respondió $url" >&2
  return 1
}
