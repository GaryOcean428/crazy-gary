#!/bin/bash

# Crazy-Gary Database Backup Script
set -e

BACKUP_DIR="/opt/crazy-gary/backups"
RETENTION_DAYS=30
DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/crazy_gary}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/crazy_gary_backup_$TIMESTAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "Starting database backup..."
echo "Timestamp: $TIMESTAMP"

# Perform backup
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"

# Verify backup integrity
if gzip -t "$BACKUP_FILE"; then
    echo "Backup integrity verified"
else
    echo "Backup integrity check failed!"
    rm -f "$BACKUP_FILE"
    exit 1
fi

# Get backup size
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "Backup size: $BACKUP_SIZE"

# Clean up old backups
find "$BACKUP_DIR" -name "crazy_gary_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

echo "Database backup completed successfully!"
echo "Backup file: $BACKUP_FILE"
echo "Size: $BACKUP_SIZE"

exit 0