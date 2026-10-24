#!/usr/bin/env bash
# Checks that a running stack answers: both API health checks report a connected database,
# and the frontend serves its login page. Exits non-zero on the first failure.
#
#   docker compose up -d --build && ./scripts/smoke-test.sh
#
# Override the URLs to point at another deployment, or set FRONTEND_URL= to skip the frontend.
set -euo pipefail

USER_SERVICE_URL="${USER_SERVICE_URL:-http://localhost:5000}"
COURSE_SERVICE_URL="${COURSE_SERVICE_URL:-http://localhost:5001}"
FRONTEND_URL="${FRONTEND_URL-http://localhost:3000}"
ATTEMPTS="${ATTEMPTS:-30}"

wait_for() {
    local name="$1" url="$2" expect="$3"
    for _ in $(seq "$ATTEMPTS"); do
        if body="$(curl -fsS --max-time 5 "$url" 2>/dev/null)" && [[ "$body" == *"$expect"* ]]; then
            echo "ok    $name  $url"
            return 0
        fi
        sleep 2
    done
    echo "FAIL  $name  $url did not return $expect" >&2
    return 1
}

wait_for user-service "$USER_SERVICE_URL/health" '"database":"connected"'
wait_for course-service "$COURSE_SERVICE_URL/health" '"database":"connected"'
if [ -n "$FRONTEND_URL" ]; then
    wait_for frontend "$FRONTEND_URL/login" '<html'
fi
echo "smoke test passed"
