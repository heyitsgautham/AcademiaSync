#!/bin/bash
# Creates the schema on the Supabase database named in deployment/.env,
# then turns on row level security and makes ADMIN_EMAIL an Admin.
# Run it from anywhere: ./deployment/init-db.sh
set -euo pipefail

# shellcheck source=deployment/config.sh
. "$(dirname "${BASH_SOURCE[0]}")/config.sh"
require_vars SUPABASE_DB_HOST SUPABASE_DB_PASSWORD ADMIN_EMAIL

export PGPASSWORD="$DB_PASSWORD"
PSQL=(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1)

echo "Applying backend/database/init.sql to ${DB_HOST}"
"${PSQL[@]}" -f "${REPO_ROOT}/backend/database/init.sql"

echo "Enabling row level security and granting Admin to ${ADMIN_EMAIL}"
"${PSQL[@]}" -v admin_email="$ADMIN_EMAIL" -f "${DEPLOY_DIR}/setup-supabase.sql"

echo "Database initialized"
