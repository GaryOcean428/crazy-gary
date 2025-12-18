#!/bin/bash

# Automated Rollback Trigger Script
set -e

TRIGGER_TYPE="$1"
THRESHOLD="$2"

echo "Automated Rollback System"
echo "Trigger: $TRIGGER_TYPE"
echo "Threshold: $THRESHOLD"

check_error_rate() {
    # Check API error rate from logs
    local error_count=$(railway logs --tail=1000 | grep -i "error\|exception" | wc -l)
    local total_requests=$(railway logs --tail=1000 | grep -c "request")
    
    if [ "$total_requests" -gt 0 ]; then
        local error_rate=$(echo "scale=2; $error_count * 100 / $total_requests" | bc)
        echo "Error rate: ${error_rate}%"
        
        if (( $(echo "$error_rate > $THRESHOLD" | bc -l) )); then
            return 0  # Trigger rollback
        fi
    fi
    return 1
}

check_response_time() {
    # Check average response time
    local response_time=$(curl -o /dev/null -s -w "%{time_total}" https://api.crazy-gary.app/health)
    echo "Response time: ${response_time}s"
    
    if (( $(echo "$response_time > $THRESHOLD" | bc -l) )); then
        return 0  # Trigger rollback
    fi
    return 1
}

check_memory_usage() {
    # Check memory usage
    local memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    echo "Memory usage: ${memory_usage}%"
    
    if (( $(echo "$memory_usage > $THRESHOLD" | bc -l) )); then
        return 0  # Trigger rollback
    fi
    return 1
}

perform_rollback() {
    echo "🚨 TRIGGERING AUTOMATED ROLLBACK"
    echo "Rolling back to previous stable version..."
    
    # Rollback API service
    railway service rollback crazy-gary-api
    
    # Rollback web service
    railway service rollback crazy-gary-web
    
    # Send alert
    ./scripts/send-alert.sh "AUTOMATED_ROLLBACK" "System rolled back due to $TRIGGER_TYPE threshold exceeded"
    
    echo "Automated rollback completed!"
}

# Execute checks based on trigger type
case "$TRIGGER_TYPE" in
    "error_rate")
        if check_error_rate; then
            perform_rollback
        fi
        ;;
    "response_time")
        if check_response_time; then
            perform_rollback
        fi
        ;;
    "memory_usage")
        if check_memory_usage; then
            perform_rollback
        fi
        ;;
    *)
        echo "Unknown trigger type: $TRIGGER_TYPE"
        exit 1
        ;;
esac

echo "Automated rollback check completed"

exit 0
