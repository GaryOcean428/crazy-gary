#!/bin/bash

# Comprehensive System Health Check
set -e

API_URL="${API_URL:-https://api.crazy-gary.app}"
DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/crazy_gary}"
ALERT_WEBHOOK_URL="${ALERT_WEBHOOK_URL:-}"

echo "Running comprehensive system health check..."

# Initialize status tracking
OVERALL_STATUS="HEALTHY"
ISSUES=()

# Check API Service Health
echo "Checking API Service..."
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health" 2>/dev/null || echo "000")
API_RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" "$API_URL/health" 2>/dev/null || echo "999")

if [ "$API_RESPONSE" = "200" ]; then
    echo "✅ API Service: Healthy (Response time: ${API_RESPONSE_TIME}s)"
else
    echo "❌ API Service: Failed (HTTP: $API_RESPONSE)"
    ISSUES+=("API Service HTTP $API_RESPONSE")
    OVERALL_STATUS="DEGRADED"
fi

# Check Database Connectivity
echo "Checking Database..."
DB_START_TIME=$(date +%s%3N)
if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    DB_END_TIME=$(date +%s%3N)
    DB_RESPONSE_TIME=$((DB_END_TIME - DB_START_TIME))
    echo "✅ Database: Connected (Response time: ${DB_RESPONSE_TIME}ms)"
else
    echo "❌ Database: Connection failed"
    ISSUES+=("Database connection failed")
    OVERALL_STATUS="DEGRADED"
fi

# Check Memory Usage
echo "Checking System Resources..."
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
DISK_USAGE=$(df / | awk 'NR==2{printf "%.1f", $5}' | sed 's/%//')

echo "Memory Usage: ${MEMORY_USAGE}%"
echo "Disk Usage: ${DISK_USAGE}%"

if (( $(echo "$MEMORY_USAGE > 90" | bc -l) )); then
    echo "⚠️ Memory usage is high: ${MEMORY_USAGE}%"
    ISSUES+=("High memory usage: ${MEMORY_USAGE}%")
    OVERALL_STATUS="DEGRADED"
fi

if [ "$DISK_USAGE" -gt 90 ]; then
    echo "⚠️ Disk usage is high: ${DISK_USAGE}%"
    ISSUES+=("High disk usage: ${DISK_USAGE}%")
    OVERALL_STATUS="DEGRADED"
fi

# Check External Services
echo "Checking External Services..."
# HuggingFace API check
HF_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "https://huggingface.co/api/status" 2>/dev/null || echo "000")
if [ "$HF_RESPONSE" = "200" ]; then
    echo "✅ HuggingFace API: Available"
else
    echo "⚠️ HuggingFace API: Issues detected (HTTP: $HF_RESPONSE)"
    ISSUES+=("HuggingFace API HTTP $HF_RESPONSE")
fi

# Generate status report
echo ""
echo "=== HEALTH CHECK SUMMARY ==="
echo "Overall Status: $OVERALL_STATUS"
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"

if [ ${#ISSUES[@]} -gt 0 ]; then
    echo "Issues Detected:"
    for issue in "${ISSUES[@]}"; do
        echo "  - $issue"
    done
else
    echo "No issues detected"
fi

# Send alert if issues found
if [ ${#ISSUES[@]} -gt 0 ] && [ -n "$ALERT_WEBHOOK_URL" ]; then
    ISSUES_TEXT=$(IFS=$'\n'; echo "${ISSUES[*]}")
    curl -X POST "$ALERT_WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{
            \"text\": \"🚨 System Health Issues Detected\",
            \"attachments\": [{
                \"color\": \"warning\",
                \"fields\": [
                    {\"title\": \"Status\", \"value\": \"$OVERALL_STATUS\", \"short\": true},
                    {\"title\": \"API Response Time\", \"value\": \"${API_RESPONSE_TIME}s\", \"short\": true},
                    {\"title\": \"Memory Usage\", \"value\": \"${MEMORY_USAGE}%\", \"short\": true},
                    {\"title\": \"Disk Usage\", \"value\": \"${DISK_USAGE}%\", \"short\": true},
                    {\"title\": \"Issues\", \"value\": \"$ISSUES_TEXT\", \"short\": false}
                ]
            }]
        }"
fi

# Return appropriate exit code
if [ "$OVERALL_STATUS" = "HEALTHY" ]; then
    exit 0
else
    exit 1
fi
