#!/bin/bash

# Disaster Recovery Testing Script
set -e

SCENARIO="$1"
DURATION="${2:-30}"

echo "Starting Disaster Recovery Test"
echo "Scenario: $SCENARIO"
echo "Duration: $DURATION minutes"

# Record start time
START_TIME=$(date +%s)

# Simulate disaster based on scenario
case "$SCENARIO" in
    "complete_outage")
        echo "Simulating complete system outage..."
        railway service stop crazy-gary-api
        railway service stop crazy-gary-web
        ;;
    "database_corruption")
        echo "Simulating database corruption..."
        railway service stop crazy-gary-db
        ;;
esac

# Run recovery procedures
echo "Running recovery procedures..."
./scripts/recovery.sh "$SCENARIO" "high"

# Monitor for duration
echo "Monitoring system for $DURATION minutes..."
END_TIME=$((START_TIME + (DURATION * 60)))
while [ $(date +%s) -lt $END_TIME ]; do
    ./scripts/health-check.sh
    sleep 300  # Check every 5 minutes
done

# Validate system functionality
echo "Validating system functionality..."
./scripts/health-check.sh

echo "Disaster Recovery Test Completed!"

exit 0
