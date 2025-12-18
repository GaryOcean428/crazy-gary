#!/bin/bash

# Incident Notification Script
set -e

SEVERITY="$1"
MESSAGE="$2"
INCIDENT_ID="${3:-INC-$(date +%Y%001)}"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
EMAIL_RECIPIENTS="${EMAIL_RECIPIENTS:-oncall@company.com}"

# Format severity for display
case "$SEVERITY" in
    "P0"|"CRITICAL")
        EMOJI="🚨"
        COLOR="danger"
        ;;
    "P1"|"HIGH")
        EMOJI="⚠️"
        COLOR="warning"
        ;;
    "P2"|"MEDIUM")
        EMOJI="⚡"
        COLOR="good"
        ;;
    "RESOLVED")
        EMOJI="✅"
        COLOR="good"
        ;;
    *)
        EMOJI="📢"
        COLOR="#439FE0"
        ;;
esac

# Send Slack notification
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST "$SLACK_WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{
            \"text\": \"$EMOJI Incident $SEVERITY: $MESSAGE\",
            \"attachments\": [{
                \"color\": \"$COLOR\",
                \"fields\": [
                    {\"title\": \"Incident ID\", \"value\": \"$INCIDENT_ID\", \"short\": true},
                    {\"title\": \"Severity\", \"value\": \"$SEVERITY\", \"short\": true},
                    {\"title\": \"Timestamp\", \"value\": \"$TIMESTAMP\", \"short\": true},
                    {\"title\": \"Message\", \"value\": \"$MESSAGE\", \"short\": false}
                ]
            }]
        }"
fi

# Send email notification
if [ -n "$EMAIL_RECIPIENTS" ]; then
    echo "Subject: [$SEVERITY] Crazy-Gary Incident - $INCIDENT_ID
    
Incident Details:
- Incident ID: $INCIDENT_ID
- Severity: $SEVERITY
- Timestamp: $TIMESTAMP
- Message: $MESSAGE

This is an automated notification from the Crazy-Gary monitoring system.
" | sendmail "$EMAIL_RECIPIENTS" 2>/dev/null || echo "Email notification failed (sendmail not available)"
fi

echo "Incident notification sent: $SEVERITY - $MESSAGE"

exit 0
