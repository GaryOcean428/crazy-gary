#!/bin/bash

# Emergency Database Restore Script
set -e

BACKUP_FILE="$1"
TARGET_DB="crazy_gary_restored"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

echo "Starting emergency database restore..."
echo "Backup file: $BACKUP_FILE"

# Create new database
psql -h localhost -U postgres -c "CREATE DATABASE $TARGET_DB;"

# Restore from backup
gunzip -c "$BACKUP_FILE" | psql -h localhost -U postgres -d "$TARGET_DB"

# Verify restore
USER_COUNT=$(psql -h localhost -U postgres -d "$TARGET_DB" -t -c "SELECT COUNT(*) FROM users;" | tr -d ' ')
echo "Users restored: $USER_COUNT"

echo "Restore completed successfully!"

exit 0