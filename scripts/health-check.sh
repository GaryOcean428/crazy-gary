#!/bin/bash

# Crazy-Gary System Health Check Script
set -e

API_URL="${API_URL:-http://localhost:5000}"
WEB_URL="${WEB_URL:-http://localhost:3000}"
DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/crazy_gary}"

echo "Running system health checks..."

# Check API health
echo "Checking API health..."
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health" || echo "000")
if [ "$API_RESPONSE" = "200" ]; then
    echo "✅ API is healthy"
else
    echo "❌ API health check failed (HTTP: $API_RESPONSE)"
fi

# Check database connectivity
echo "Checking database connectivity..."
if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database is accessible"
else
    echo "❌ Database connection failed"
fi

# Check response times
echo "Checking response times..."
API_RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" "$API_URL/health" || echo "999")
echo "API response time: ${API_RESPONSE_TIME}s"

# Check memory usage
echo "Checking memory usage..."
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
echo "Memory usage: ${MEMORY_USAGE}%"

# Check disk usage
echo "Checking disk usage..."
DISK_USAGE=$(df / | awk 'NR==2{printf "%.1f", $5}' | sed 's/%//')
echo "Disk usage: ${DISK_USAGE}%"

echo "Health check completed!"

# Return appropriate exit code
if [ "$API_RESPONSE" = "200" ] && [ "$DISK_USAGE" -lt 90 ]; then
    exit 0
else
    exit 1
fi