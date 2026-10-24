#!/usr/bin/env bash
# Loads the demo dataset into the docker compose database.
# It truncates every table first, so only run it against a local or demo stack.
set -euo pipefail

cd "$(dirname "$0")/.."
set -a
# shellcheck disable=SC1091
[ -f .env ] && . ./.env
set +a

cat backend/database/seed/*.sql |
    docker compose exec -T db psql -v ON_ERROR_STOP=1 -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-academiasync}"
