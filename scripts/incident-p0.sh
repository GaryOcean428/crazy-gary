#!/bin/bash

# P0 Incident Response Script
set -e

echo "P0 Incident: System Outage Response"

# 1. Immediate Assessment
echo "Step 1: Immediate Assessment"
railway status
curl -I https://api.crazy-gary.app/health

# 2. Initial Response
echo "Step 2: Initial Response"
./scripts/send-alert.sh "P0" "System outage detected"

# 3. Service Recovery
echo "Step 3: Service Recovery"
railway service restart crazy-gary-api
railway service restart crazy-gary-web
sleep 30

# 4. Database Recovery
echo "Step 4: Database Recovery"
railway service restart crazy-gary-db
sleep 60

# 5. Validation
echo "Step 5: System Validation"
./scripts/health-check.sh

# 6. Status Update
echo "Step 6: Status Update"
./scripts/send-alert.sh "RESOLVED" "System restored"

echo "P0 Incident Response Completed"
