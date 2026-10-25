#!/bin/bash
# Shared settings for the Cloud Run scripts in this folder. Source it, do not run it.
# It loads deployment/.env and stops with a message when a required value is missing,
# so no project id, database host or secret is written into the scripts themselves.

DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${DEPLOY_DIR}/.." && pwd)"
ENV_FILE="${DEPLOY_DIR}/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "deployment/.env not found. Copy deployment/.env.example to deployment/.env and fill it in." >&2
    exit 1
fi

set -a
# shellcheck source=/dev/null
. "$ENV_FILE"
set +a

# Stops the calling script when any named variable is unset or empty.
require_vars() {
    local name
    for name in "$@"; do
        if [ -z "${!name:-}" ]; then
            echo "Set ${name} in deployment/.env" >&2
            exit 1
        fi
    done
}

require_vars GCP_PROJECT_ID

GCP_REGION="${GCP_REGION:-asia-south1}"
ARTIFACT_REGISTRY_REPO="${ARTIFACT_REGISTRY_REPO:-academiasync-repo}"
REGISTRY_URL="${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${ARTIFACT_REGISTRY_REPO}"

USER_SERVICE_NAME=academiasync-user-service
COURSE_SERVICE_NAME=academiasync-course-service
FRONTEND_SERVICE_NAME=academiasync-frontend

# Supabase connection, used by deploy.sh and init-db.sh
DB_HOST="${SUPABASE_DB_HOST:-}"
DB_PORT="${SUPABASE_DB_PORT:-5432}"
DB_NAME="${SUPABASE_DB_NAME:-postgres}"
DB_USER="${SUPABASE_DB_USER:-postgres}"
DB_PASSWORD="${SUPABASE_DB_PASSWORD:-}"
