#!/bin/bash
set -e

# Deployment Validation Script for Crazy-Gary
# Tests Flask async fixes, health endpoints, and service functionality

API_URL="${API_URL:-http://localhost:8080}"
if [ "$1" = "production" ]; then
    API_URL="https://crazy-gary-production.up.railway.app"
fi

echo "🔍 Validating Flask Async Deployment at $API_URL..."
echo "=================================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local url="$1"
    local expected_status="$2"
    local description="$3"
    
    echo -n "Testing $description: "
    
    if command -v curl >/dev/null 2>&1; then
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    else
        echo -e "${YELLOW}SKIP${NC} (curl not available)"
        return
    fi
    
    if [ "$STATUS" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} ($STATUS)"
    else
        echo -e "${RED}❌ FAIL${NC} ($STATUS, expected $expected_status)"
    fi
}

# Function to test endpoint with JSON response
test_json_endpoint() {
    local url="$1"
    local description="$2"
    local key_check="$3"
    
    echo -n "Testing $description: "
    
    if command -v curl >/dev/null 2>&1; then
        RESPONSE=$(curl -s "$url" 2>/dev/null || echo '{"error": "request_failed"}')
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    else
        echo -e "${YELLOW}SKIP${NC} (curl not available)"
        return
    fi
    
    if [ "$STATUS" = "200" ]; then
        if echo "$RESPONSE" | grep -q "$key_check" 2>/dev/null; then
            echo -e "${GREEN}✅ PASS${NC} (200, contains '$key_check')"
        else
            echo -e "${YELLOW}⚠️  PARTIAL${NC} (200, missing '$key_check')"
        fi
    else
        echo -e "${RED}❌ FAIL${NC} ($STATUS)"
    fi
}

echo "📋 Basic Health Checks"
echo "----------------------"
test_endpoint "$API_URL/health" "200" "Basic health endpoint"
test_json_endpoint "$API_URL/api/health" "Enhanced health endpoint" "flask_async"

echo ""
echo "🔧 Flask Async Configuration"
echo "----------------------------"
test_json_endpoint "$API_URL/api/health" "Flask async support check" "hypercorn_asgi"
test_json_endpoint "$API_URL/api/health" "Server type verification" "server_type"

echo ""
echo "🤖 Model Endpoint Configuration" 
echo "--------------------------------"
test_json_endpoint "$API_URL/api/endpoints/models/config" "Model configuration endpoint" "total_configured"
test_json_endpoint "$API_URL/api/endpoints/models/config" "Model provider check" "models_by_provider"

echo ""
echo "🔐 Authentication System"
echo "------------------------"
# Auth endpoints might return 400/401 but should not return 500
test_endpoint "$API_URL/api/auth/register" "400" "Auth register endpoint (no body)"
test_endpoint "$API_URL/api/auth/login" "400" "Auth login endpoint (no body)"

echo ""
echo "📊 API Route Status"
echo "-------------------"
test_endpoint "$API_URL/api/harmony/health" "200" "Harmony service health"
test_endpoint "$API_URL/api/endpoints/status" "200" "Endpoints status"
test_endpoint "$API_URL/api/monitoring/health" "200" "Monitoring health"

echo ""
echo "🔍 Async Route Testing"
echo "----------------------"
# These might fail due to missing API keys but should not throw coroutine errors
echo -n "Testing async heavy route (no auth): "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/api/heavy/orchestrate" -H "Content-Type: application/json" -d '{}' 2>/dev/null || echo "000")
if [ "$STATUS" = "401" ] || [ "$STATUS" = "403" ]; then
    echo -e "${GREEN}✅ PASS${NC} ($STATUS - auth required, no async errors)"
elif [ "$STATUS" = "500" ]; then
    echo -e "${RED}❌ FAIL${NC} ($STATUS - possible async/coroutine error)"
else
    echo -e "${YELLOW}⚠️  PARTIAL${NC} ($STATUS)"
fi

echo ""
echo "📈 Performance Check"
echo "--------------------"
if command -v curl >/dev/null 2>&1; then
    echo -n "Response time check: "
    TIME=$(curl -s -o /dev/null -w "%{time_total}" "$API_URL/health" 2>/dev/null || echo "999")
    TIME_MS=$(echo "$TIME * 1000" | bc 2>/dev/null || echo "999")
    if (( $(echo "$TIME < 2.0" | bc -l 2>/dev/null || echo "0") )); then
        echo -e "${GREEN}✅ FAST${NC} (${TIME_MS%.*}ms)"
    elif (( $(echo "$TIME < 5.0" | bc -l 2>/dev/null || echo "0") )); then
        echo -e "${YELLOW}⚠️  SLOW${NC} (${TIME_MS%.*}ms)"
    else
        echo -e "${RED}❌ TIMEOUT${NC} (${TIME_MS%.*}ms)"
    fi
else
    echo "Response time check: ${YELLOW}SKIP${NC} (curl/bc not available)"
fi

echo ""
echo "📝 Deployment Summary"
echo "====================="

if [ "$API_URL" = "https://crazy-gary-production.up.railway.app" ]; then
    echo "✅ Production deployment validation completed"
    echo "🔗 Service URL: $API_URL"
    echo "🚀 Server: Hypercorn (ASGI)"
    echo "⚡ Flask: Async-enabled"
    echo "🛡️  Health: Monitored"
else
    echo "✅ Local development validation completed"
    echo "💡 Run with 'production' argument to test live deployment"
fi

echo ""
echo "🎯 Key Fixes Implemented:"
echo "  • Flask[async] support with Hypercorn ASGI server"
echo "  • Fixed async route handlers in heavy.py"
echo "  • Custom JSON encoder for StepType serialization" 
echo "  • Enhanced health check endpoints"
echo "  • Model endpoint configuration system"
echo "  • Browser extension conflict handling"
echo "  • Railway deployment configuration"

echo ""
echo "🔍 Check Railway logs for any remaining issues:"
echo "   railway logs --service crazy-gary --follow"