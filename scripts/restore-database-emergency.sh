#!/bin/bash

# Crazy-Gary Emergency Database Restore Script
set -e

BACKUP_FILE="$1"
TARGET_DB="crazy_gary_restored"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    echo "Example: $0 /opt/crazy-gary/backups/crazy_gary_backup_20251217_020000.sql.gz"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "Starting emergency database restore..."
echo "Backup file: $BACKUP_FILE"
echo "Target database: $TARGET_DB"
echo "Timestamp: $TIMESTAMP"

# Create new database for restore
echo "Creating target database..."
psql -h localhost -U postgres -c "CREATE DATABASE $TARGET_DB;"

# Restore from backup
echo "Restoring database from backup..."
gunzip -c "$BACKUP_FILE" | psql -h localhost -U postgres -d "$TARGET_DB"

# Verify restore
echo "Verifying restore..."
USER_COUNT=$(psql -h localhost -U postgres -d "$TARGET_DB" -t -c "SELECT COUNT(*) FROM users;" | tr -d ' ')
TASK_COUNT=$(psql -h localhost -U postgres -d "$TARGET_DB" -t -c "SELECT COUNT(*) FROM tasks;" | tr -d ' ')

echo "Users restored: $USER_COUNT"
echo "Tasks restored: $TASK_COUNT"

# Update application configuration
echo "Updating application configuration..."
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/$TARGET_DB"

echo "Database restore completed successfully!"
echo "Next steps:"
echo "1. Update DATABASE_URL in Railway environment"
echo "2. Restart application services"
echo "3. Run application health checks"
echo "4. Verify data integrity"

exit 0