#!/bin/bash

# Security Audit Script for Crazy Gary Project
# Performs comprehensive security checks on both frontend and backend

set -e

echo "🔒 Starting Security Audit..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running in CI
if [ "$CI" = "true" ]; then
    echo "Running in CI mode"
fi

# Function to check command existence
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Frontend Security Audit
echo -e "\n${YELLOW}📦 Frontend Security Audit${NC}"
if [ -d "apps/web" ]; then
    cd apps/web
    
    # Check for yarn audit
    if command_exists yarn; then
        echo "Running yarn audit..."
        yarn audit --level moderate || true
    fi
    
    # Check for outdated packages
    echo "Checking for outdated packages..."
    yarn outdated || true
    
    cd ../..
fi

# Backend Security Audit
echo -e "\n${YELLOW}🐍 Backend Security Audit${NC}"
if [ -d "apps/api" ]; then
    cd apps/api
    
    # Check for Python safety
    if command_exists safety; then
        echo "Running safety check..."
        safety check --json || true
    else
        echo "Installing safety..."
        pip install safety
        safety check --json || true
    fi
    
    # Check for pip-audit
    if command_exists pip-audit; then
        echo "Running pip-audit..."
        pip-audit || true
    else
        echo "Installing pip-audit..."
        pip install pip-audit
        pip-audit || true
    fi
    
    cd ../..
fi

# Check for secrets in code
echo -e "\n${YELLOW}🔍 Checking for Secrets${NC}"

# Simple check for common secret patterns
echo "Scanning for potential secrets..."
grep -r -E "(api[_-]?key|secret|token|password|pwd)\s*=\s*['\"][^'\"]+['\"]" \
    --include="*.js" \
    --include="*.jsx" \
    --include="*.ts" \
    --include="*.tsx" \
    --include="*.py" \
    --exclude-dir="node_modules" \
    --exclude-dir=".git" \
    --exclude-dir="dist" \
    --exclude-dir="build" \
    --exclude="*.test.*" \
    --exclude="*.spec.*" \
    . 2>/dev/null | grep -v "example" | grep -v "placeholder" || echo "✅ No obvious secrets found"

# Check for .env files
echo -e "\n${YELLOW}📄 Checking .env files${NC}"
if [ -f ".env" ]; then
    echo -e "${RED}⚠️  .env file found in repository root - ensure it's in .gitignore${NC}"
fi

# Check .gitignore
if ! grep -q "^\.env$" .gitignore 2>/dev/null; then
    echo -e "${RED}⚠️  .env is not in .gitignore${NC}"
else
    echo "✅ .env is properly ignored"
fi

# Security Headers Check (for production)
echo -e "\n${YELLOW}🛡️ Security Headers Recommendations${NC}"
echo "Ensure the following headers are configured in production:"
echo "  - Content-Security-Policy"
echo "  - X-Frame-Options"
echo "  - X-Content-Type-Options"
echo "  - Strict-Transport-Security"
echo "  - X-XSS-Protection"

# CORS Check
echo -e "\n${YELLOW}🌐 CORS Configuration Check${NC}"
if grep -q "CORS_ORIGINS.*\*" apps/api/src/main.py 2>/dev/null; then
    echo -e "${YELLOW}⚠️  CORS is configured with wildcard (*) - restrict in production${NC}"
else
    echo "✅ CORS appears to be properly configured"
fi

# SSL/TLS Check
echo -e "\n${YELLOW}🔐 SSL/TLS Recommendations${NC}"
echo "Ensure HTTPS is enforced in production with:"
echo "  - Valid SSL certificate"
echo "  - TLS 1.2 or higher"
echo "  - Strong cipher suites"

# Summary
echo -e "\n${GREEN}✅ Security Audit Complete${NC}"
echo "Review the output above for any security issues."
echo "For production deployment, ensure:"
echo "  1. All dependencies are up to date"
echo "  2. No secrets in code"
echo "  3. Proper security headers"
echo "  4. HTTPS enforcement"
echo "  5. Rate limiting enabled"
echo "  6. Input validation"
echo "  7. SQL injection prevention"
echo "  8. XSS protection"

exit 0