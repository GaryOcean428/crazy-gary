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
railway status || echo "Railway status check failed"

# Phase 2: Service Restart (if applicable)
if [ "$INCIDENT_TYPE" = "service_hang" ] || [ "$INCIDENT_TYPE" = "memory_leak" ]; then
    echo "Phase 2: Service Restart"
    railway service restart crazy-gary-api || echo "API restart failed"
    railway service restart crazy-gary-web || echo "Web restart failed"
    sleep 30
fi

# Phase 3: Database Recovery (if needed)
if [ "$INCIDENT_TYPE" = "database_corruption" ] || [ "$INCIDENT_TYPE" = "data_loss" ]; then
    echo "Phase 3: Database Recovery"
    railway service restart crazy-gary-db || echo "DB restart failed"
    sleep 60
    
    # Run database integrity checks
    psql -h localhost -U postgres -d crazy_gary -c "VACUUM ANALYZE;" || echo "VACUUM failed"
    psql -h localhost -U postgres -d crazy_gary -c "REINDEX DATABASE crazy_gary;" || echo "REINDEX failed"
fi

# Phase 4: Full Redeployment (if needed)
if [ "$INCIDENT_TYPE" = "deployment_failure" ] || [ "$SEVERITY" = "critical" ]; then
    echo "Phase 4: Full Redeployment"
    railway down || echo "Railway down failed"
    railway up --detach || echo "Railway up failed"
fi

# Phase 5: Validation
echo "Phase 5: System Validation"
sleep 60
./scripts/health-check.sh

echo "Infrastructure recovery completed!"

exit 0