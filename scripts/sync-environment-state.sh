#!/bin/bash

# Environment State Synchronization Script
set -e

SOURCE_ENV="$1"
TARGET_ENV="$2"

if [ -z "$SOURCE_ENV" ] || [ -z "$TARGET_ENV" ]; then
    echo "Usage: $0 <source_env> <target_env>"
    echo "Example: $0 production staging"
    exit 1
fi

echo "Synchronizing state from $SOURCE_ENV to $TARGET_ENV"

# Sync database schema
echo "Syncing database schema..."
pg_dump --schema-only --host=localhost --username=postgres --dbname="crazy_gary_$SOURCE_ENV" \
  > schema_migration.sql

psql --host=localhost --username=postgres --dbname="crazy_gary_$TARGET_ENV" < schema_migration.sql

# Sync configuration
echo "Syncing configuration..."
railway service config list --service crazy-gary-api --env $SOURCE_ENV > source_config.json
railway service config list --service crazy-gary-web --env $SOURCE_ENV > source_web_config.json

# Apply to target (excluding secrets)
jq 'with_entries(select(.key | test("SECRET|PASSWORD|KEY")) | .value = "***REDACTED***")' \
  source_config.json > redacted_config.json

railway service config set --service crazy-gary-api --env $TARGET_ENV < redacted_config.json
railway service config set --service crazy-gary-web --env $TARGET_ENV < source_web_config.json

# Sync user sessions
echo "Syncing active user sessions..."
node scripts/migrate-sessions.js "crazy_gary_$SOURCE_ENV" "crazy_gary_$TARGET_ENV"

# Cleanup
rm -f schema_migration.sql source_config.json source_web_config.json redacted_config.json

echo "Environment synchronization completed!"

exit 0
