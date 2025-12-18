#!/bin/bash

# Infrastructure Recovery Script
set -e

INCIDENT_TYPE="$1"
SEVERITY="${2:-medium}"

echo "Starting infrastructure recovery..."
echo "Incident type: $INCIDENT_TYPE"
echo "Severity: $SEVERITY"

# Phase 1: Assessment
echo "Phase 1: Incident Assessment"
railway status

# Phase 2: Service Restart
if [ "$INCIDENT_TYPE" = "service_hang" ]; then
    echo "Phase 2: Service Restart"
    railway service restart crazy-gary-api
    railway service restart crazy-gary-web
    sleep 30
fi

# Phase 3: Database Recovery
if [ "$INCIDENT_TYPE" = "database_corruption" ]; then
    echo "Phase 3: Database Recovery"
    railway service restart crazy-gary-db
    sleep 60
fi

# Phase 4: Validation
echo "Phase 4: System Validation"
sleep 60
./scripts/health-check.sh

echo "Recovery completed!"
