#!/bin/bash
set -e

# Database Config
DB_HOST="db.bdjvbfrrohqykxuushok.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"
# Try to load from .env
if [ -f ".env" ]; then
    source .env
    DB_PASSWORD="${SUPABASE_DB_PASSWORD:-${DB_PASSWORD:-}}"
fi

if [ -z "$DB_PASSWORD" ]; then
    echo "❌ Set SUPABASE_DB_PASSWORD in .env file!"
    echo "Get it from: https://supabase.com/dashboard/project/bdjvbfrrohqykxuushok/settings/database"
    exit 1
fi

echo "🔧 Initializing Supabase Database"

SQL_FILE="deployment/setup-supabase.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo "❌ SQL file not found: $SQL_FILE"
    exit 1
fi

# Execute SQL using psql
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SQL_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database initialized!"
    echo "✅ Admin user set: heyitsgautham@gmail.com"
else
    echo ""
    echo "❌ Failed! Install psql or run manually:"
    echo "   https://supabase.com/dashboard/project/bdjvbfrrohqykxuushok/editor"
fi

