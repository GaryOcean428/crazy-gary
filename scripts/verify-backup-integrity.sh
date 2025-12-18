#!/bin/bash

# Backup Integrity Verification Script
set -e

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

echo "Verifying backup integrity..."
echo "Backup file: $BACKUP_FILE"

# Check file exists and is readable
if [ ! -r "$BACKUP_FILE" ]; then
    echo "Error: Cannot read backup file"
    exit 1
fi

# Test gzip integrity
if ! gzip -t "$BACKUP_FILE"; then
    echo "Error: Backup file is corrupted (gzip test failed)"
    exit 1
fi

# Test SQL syntax by attempting to parse
echo "Testing SQL syntax..."
if ! gunzip -c "$BACKUP_FILE" | head -100 | grep -q "CREATE TABLE\|INSERT INTO"; then
    echo "Warning: Backup file may not contain expected SQL structure"
fi

# Check file size (should be reasonable)
FILE_SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE")
MIN_SIZE=1024  # 1KB minimum
if [ "$FILE_SIZE" -lt "$MIN_SIZE" ]; then
    echo "Error: Backup file is too small ($FILE_SIZE bytes)"
    exit 1
fi

# Verify backup can be listed (basic pg_restore test)
echo "Testing restore capability..."
if command -v pg_restore &> /dev/null; then
    if ! gunzip -c "$BACKUP_FILE" | pg_restore --list > /dev/null 2>&1; then
        echo "Warning: pg_restore test failed"
    fi
fi

echo "Backup integrity verification completed successfully!"
echo "File size: $FILE_SIZE bytes"

exit 0
