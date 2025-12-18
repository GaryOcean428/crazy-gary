#!/bin/bash

# System Monitoring Script
set -e

API_URL="${API_URL:-https://api.crazy-gary.app}"
ALERT_WEBHOOK_URL="$1"

check_api_health() {
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")
    if [ "$response" != "200" ]; then
        send_alert "API Health Check Failed" "HTTP Status: $response"
        return 1
    fi
    return 0
}

check_database() {
    psql -h localhost -U postgres -d crazy_gary -c "SELECT 1;" > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        send_alert "Database Connection Failed" "Cannot connect to database"
        return 1
    fi
    return 0
}

send_alert() {
    local title="$1"
    local message="$2"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    if [ -n "$ALERT_WEBHOOK_URL" ]; then
        curl -X POST "$ALERT_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{
                \"text\": \"🚨 $title\",
                \"attachments\": [{
                    \"color\": \"danger\",
                    \"fields\": [
                        {\"title\": \"Message\", \"value\": \"$message\", \"short\": false},
                        {\"title\": \"Timestamp\", \"value\": \"$timestamp\", \"short\": true}
                    ]
                }]
            }"
    fi
}

# Main monitoring loop
while true; do
    check_api_health
    check_database
    sleep 60
done
