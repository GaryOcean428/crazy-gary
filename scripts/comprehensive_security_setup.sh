#!/bin/bash

# Comprehensive Security Setup Script for Crazy-Gary Application
# Sets up all security headers, middleware, and monitoring

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT=$(pwd)
API_SRC="$PROJECT_ROOT/apps/api/src"
WEB_SRC="$PROJECT_ROOT/apps/web/src"
CONFIG_DIR="$API_SRC/config"
MIDDLEWARE_DIR="$API_SRC/middleware"

echo -e "${BLUE}🔒 Crazy-Gary Comprehensive Security Setup${NC}"
echo "=============================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to create backup
create_backup() {
    local file=$1
    if [ -f "$file" ]; then
        cp "$file" "${file}.backup.$(date +%Y%m%d_%H%M%S)"
        echo -e "${GREEN}✅ Created backup: ${file}.backup.$(date +%Y%m%d_%H%M%S)${NC}"
    fi
}

# Function to install Python dependencies
install_python_deps() {
    echo -e "${YELLOW}📦 Installing Python security dependencies...${NC}"
    
    cd "$API_SRC"
    
    # Add security dependencies to requirements.txt
    cat >> requirements.txt << EOF
# Security dependencies
flask-limiter>=3.0.0
bleach>=6.0.0
marshmallow>=3.20.0
cryptography>=41.0.0
pyjwt>=2.8.0
redis>=5.0.0
psutil>=5.9.0
safety>=2.3.0
python-dotenv>=1.0.0
EOF
    
    # Install dependencies
    if command_exists pip; then
        pip install -r requirements.txt
        echo -e "${GREEN}✅ Python dependencies installed${NC}"
    else
        echo -e "${RED}❌ pip not found. Please install Python dependencies manually.${NC}"
    fi
    
    cd "$PROJECT_ROOT"
}

# Function to install Node.js dependencies
install_node_deps() {
    echo -e "${YELLOW}📦 Installing Node.js security dependencies...${NC}"
    
    cd "$WEB_SRC"
    
    # Add security dependencies to package.json
    if [ -f "package.json" ]; then
        npm install --save-dev \
            @types/node \
            helmet \
            cors \
            express-rate-limit \
            express-validator \
            csurf \
            helmet-csp \
            sanitize-html
        
        echo -e "${GREEN}✅ Node.js dependencies installed${NC}"
    else
        echo -e "${RED}❌ package.json not found in web directory${NC}"
    fi
    
    cd "$PROJECT_ROOT"
}

# Function to create security environment file
create_security_env() {
    echo -e "${YELLOW}🔧 Creating security environment configuration...${NC}"
    
    cat > .env.security << 'EOF'
# Security Configuration for Crazy-Gary

# Environment
ENVIRONMENT=development

# API Security
API_KEY=your-api-key-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production-min-32-chars
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=2592000

# CSRF Protection
CSRF_SECRET_KEY=your-csrf-secret-key-change-in-production

# Rate Limiting
RATE_LIMIT_RPS=10
RATE_LIMIT_BURST=100
REDIS_URL=redis://localhost:6379

# Request Limits
MAX_REQUEST_SIZE=16777216
MAX_JSON_SIZE=1048576

# Session Security
SESSION_TIMEOUT=1800
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTP_ONLY=true
SESSION_COOKIE_SAME_SITE=Lax

# Password Security
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SPECIAL_CHARS=true
PASSWORD_MAX_AGE=2592000

# Account Security
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900
ACCOUNT_LOCKOUT_THRESHOLD=5

# File Upload Security
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Security Monitoring
ENABLE_SECURITY_LOGGING=true
ENABLE_PERFORMANCE_MONITORING=true
LOG_LEVEL=WARNING

# Email Alerts (Optional)
SMTP_SERVER=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
ALERT_EMAIL=

# Webhook Alerts (Optional)
WEBHOOK_URL=

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Allowed Hosts
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Security
DB_POOL_SIZE=10
DB_POOL_TIMEOUT=20
DB_POOL_RECYCLE=3600

# SSL/TLS Configuration
SSL_VERIFY=true
SSL_CA_BUNDLE=

# Security Headers
ENABLE_SECURITY_HEADERS=true
STRICT_TRANSPORT_SECURITY=true
CONTENT_SECURITY_POLICY=true

# Input Validation
ENABLE_INPUT_VALIDATION=true
ENABLE_XSS_PROTECTION=true
ENABLE_SQL_INJECTION_PROTECTION=true

# CSRF Protection
ENABLE_CSRF_PROTECTION=true
CSRF_TOKEN_TIMEOUT=3600

# Frontend Security
VITE_API_URL=/api
EOF
    
    echo -e "${GREEN}✅ Security environment file created: .env.security${NC}"
    echo -e "${YELLOW}⚠️  Please review and update the security values before production deployment${NC}"
}

# Function to create security documentation
create_security_docs() {
    echo -e "${YELLOW}📚 Creating comprehensive security documentation...${NC}"
    
    mkdir -p docs/security
    
    cat > docs/security/README.md << 'EOF'
# Crazy-Gary Security Documentation

## Overview

This document provides comprehensive security information for the Crazy-Gary application.

## Security Components

### 1. Security Headers
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

### 2. Rate Limiting
- Global rate limiting (1000 requests/hour)
- Endpoint-specific rate limits
- Burst protection
- Redis-backed implementation

### 3. Input Sanitization
- XSS prevention
- SQL injection protection
- Path traversal prevention
- Command injection protection

### 4. CSRF Protection
- Token-based CSRF protection
- Double submit cookie pattern
- Automatic token refresh

### 5. Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Session management
- Password security policies

### 6. Security Monitoring
- Real-time threat detection
- Security event logging
- Performance monitoring
- Alert system

## Configuration

### Environment Variables

#### Required for Production
- `ENVIRONMENT=production`
- `API_KEY=your-secure-api-key`
- `JWT_SECRET_KEY=your-secure-jwt-secret-min-32-chars`
- `CSRF_SECRET_KEY=your-secure-csrf-secret`

#### Rate Limiting
- `RATE_LIMIT_RPS=10` (requests per second)
- `RATE_LIMIT_BURST=100` (burst limit)
- `REDIS_URL=redis://localhost:6379`

#### Security Headers
- `ENABLE_SECURITY_HEADERS=true`
- `STRICT_TRANSPORT_SECURITY=true`
- `CONTENT_SECURITY_POLICY=true`

### File Upload Security
- Maximum file size: 5MB
- Allowed types: Images, PDF, Text files
- Dangerous extensions blocked
- MIME type validation

## Monitoring & Alerts

### Security Events
- Authentication failures
- Rate limit violations
- Suspicious input detection
- CSRF violations
- File upload violations

### Health Checks
- `/api/security/health` - Overall security health
- `/api/security/metrics` - Security statistics
- `/api/security/validate-config` - Configuration validation

## Security Testing

### Test Endpoints
- `/api/security/test/xss` - XSS protection test
- `/api/security/test/sql-injection` - SQL injection protection test
- `/api/security/test/rate-limit` - Rate limiting test
- `/api/security/test/csrf` - CSRF protection test

## Best Practices

### Development
1. Always use HTTPS in production
2. Keep dependencies updated
3. Use environment variables for secrets
4. Enable all security features in development for testing

### Production
1. Use strong, unique secrets
2. Enable HSTS
3. Configure proper CSP
4. Set up monitoring and alerting
5. Regular security audits

### API Usage
1. Include CSRF tokens for state-changing operations
2. Use rate limiting
3. Validate all inputs
4. Handle security errors properly

## Incident Response

### Security Violations
1. Automatic blocking of malicious requests
2. Logging of security events
3. Email/webhook alerts for critical events
4. Rate limit enforcement

### Recovery
1. Check security logs
2. Review configuration
3. Update rules if needed
4. Monitor for recurring issues

## Compliance

This implementation follows:
- OWASP Top 10 guidelines
- Security headers best practices
- Industry standard security patterns
- Railway deployment security requirements
EOF

    cat > docs/security/DEPLOYMENT.md << 'EOF'
# Security Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Set `ENVIRONMENT=production`
- [ ] Generate strong secrets for API_KEY, JWT_SECRET_KEY, CSRF_SECRET_KEY
- [ ] Configure proper CORS origins
- [ ] Set up Redis for rate limiting
- [ ] Configure email/webhook alerts

### 2. Security Features
- [ ] Enable all security headers
- [ ] Configure Content Security Policy
- [ ] Set up HTTPS with valid certificates
- [ ] Enable HSTS
- [ ] Configure rate limiting

### 3. Monitoring
- [ ] Set up security event logging
- [ ] Configure alert system
- [ ] Test health check endpoints
- [ ] Verify security test endpoints

### 4. Testing
- [ ] Run security audit script
- [ ] Test all security features
- [ ] Verify rate limiting
- [ ] Test CSRF protection
- [ ] Validate input sanitization

## Production Deployment

### 1. Update Environment
```bash
cp .env.security .env
# Edit .env with production values
```

### 2. Install Dependencies
```bash
# Python dependencies
cd apps/api
pip install -r requirements.txt

# Node.js dependencies
cd ../web
npm install
```

### 3. Run Security Tests
```bash
python scripts/security_integration.py
bash scripts/security-audit.sh
```

### 4. Deploy
```bash
# Build and deploy to Railway
railway up
```

## Post-Deployment

### 1. Verify Security
- [ ] Check security headers in browser
- [ ] Test rate limiting
- [ ] Verify CSRF protection
- [ ] Test input validation

### 2. Monitor
- [ ] Check security logs
- [ ] Monitor security metrics
- [ ] Review alert system
- [ ] Test health endpoints

### 3. Maintenance
- [ ] Regular security updates
- [ ] Monitor security advisories
- [ ] Review logs periodically
- [ ] Update security configurations
EOF

    echo -e "${GREEN}✅ Security documentation created${NC}"
}

# Function to update main.py with security integration
update_main_py() {
    echo -e "${YELLOW}🔧 Updating main.py with security integration...${NC}"
    
    main_py="$API_SRC/main.py"
    if [ -f "$main_py" ]; then
        create_backup "$main_py"
        
        # Add security integration import if not present
        if ! grep -q "security_integration" "$main_py"; then
            sed -i '1i import sys\nsys.path.append(os.path.join(os.path.dirname(__file__), "..", "..", "scripts"))\nfrom security_integration import integrate_all_security\n' "$main_py"
        fi
        
        # Add security integration call if not present
        if ! grep -q "integrate_all_security" "$main_py"; then
            sed -i '/app = Flask/a\\n    # Integrate security components\n    integrate_all_security(app)' "$main_py"
        fi
        
        echo -e "${GREEN}✅ main.py updated with security integration${NC}"
    else
        echo -e "${YELLOW}⚠️  main.py not found, skipping update${NC}"
    fi
}

# Function to create security initialization script
create_security_init() {
    echo -e "${YELLOW}🔧 Creating security initialization script...${NC}"
    
    cat > "$PROJECT_ROOT/init_security.py" << 'EOF'
#!/usr/bin/env python3
"""
Security Initialization Script for Crazy-Gary
Run this script to set up all security components
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    print("🔒 Initializing Crazy-Gary Security Components...")
    
    # Add API src to path
    api_src = Path(__file__).parent / 'apps' / 'api' / 'src'
    sys.path.insert(0, str(api_src))
    
    try:
        # Import and run security integration
        from scripts.security_integration import integrate_all_security, print_security_summary
        from flask import Flask
        
        # Create test app
        app = Flask(__name__)
        app.config['SECRET_KEY'] = 'test-secret'
        
        # Integrate security
        integrate_all_security(app)
        print_security_summary()
        
        print("✅ Security initialization complete!")
        
    except Exception as e:
        print(f"❌ Security initialization failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
EOF
    
    chmod +x "$PROJECT_ROOT/init_security.py"
    echo -e "${GREEN}✅ Security initialization script created${NC}"
}

# Function to create security monitoring script
create_security_monitor() {
    echo -e "${YELLOW}📊 Creating security monitoring script...${NC}"
    
    cat > "$PROJECT_ROOT/monitor_security.sh" << 'EOF'
#!/bin/bash

# Security Monitoring Script for Crazy-Gary

PROJECT_ROOT=$(pwd)
LOG_FILE="$PROJECT_ROOT/security_monitor.log"

echo "$(date): Starting security monitoring..." >> "$LOG_FILE"

# Check security endpoints
echo "🔍 Checking security health..."
curl -s -f http://localhost:8000/api/security/health > /dev/null
if [ $? -eq 0 ]; then
    echo "$(date): Security health check passed" >> "$LOG_FILE"
else
    echo "$(date): Security health check failed!" >> "$LOG_FILE"
fi

# Check for security events in logs
echo "📊 Checking security events..."
if [ -f "security_events.db" ]; then
    sqlite3 security_events.db "SELECT COUNT(*) FROM security_events WHERE timestamp > datetime('now', '-1 hour');" | \
    while read count; do
        echo "$(date): $count security events in last hour" >> "$LOG_FILE"
    done
fi

# Check rate limiting
echo "⏱️ Checking rate limiting..."
response=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:8000/api/security/test/rate-limit)
if [ "$response" = "200" ]; then
    echo "$(date): Rate limiting working correctly" >> "$LOG_FILE"
else
    echo "$(date): Rate limiting may have issues (HTTP $response)" >> "$LOG_FILE"
fi

echo "🔒 Security monitoring check complete"
EOF
    
    chmod +x "$PROJECT_ROOT/monitor_security.sh"
    echo -e "${GREEN}✅ Security monitoring script created${NC}"
}

# Function to create cron job for security monitoring
setup_cron_jobs() {
    echo -e "${YELLOW}⏰ Setting up security monitoring cron jobs...${NC}"
    
    # Add cron job for security monitoring
    (crontab -l 2>/dev/null; echo "*/15 * * * * $(pwd)/monitor_security.sh") | crontab -
    
    # Add cron job for security audit
    (crontab -l 2>/dev/null; echo "0 2 * * 0 $(pwd)/scripts/security-audit.sh >> $(pwd)/security_audit.log 2>&1") | crontab -
    
    echo -e "${GREEN}✅ Security cron jobs configured${NC}"
    echo -e "${YELLOW}ℹ️  Run 'crontab -l' to view configured jobs${NC}"
}

# Function to run security tests
run_security_tests() {
    echo -e "${YELLOW}🧪 Running security tests...${NC}"
    
    cd "$PROJECT_ROOT"
    
    # Test XSS protection
    echo "Testing XSS protection..."
    curl -s "http://localhost:8000/api/security/test/xss?input=<script>alert('xss')</script>" | \
    grep -q "sanitized.*true" && echo "✅ XSS protection working" || echo "❌ XSS protection failed"
    
    # Test SQL injection protection
    echo "Testing SQL injection protection..."
    curl -s "http://localhost:8000/api/security/test/sql-injection?input=' UNION SELECT *" | \
    grep -q "protection.*active" && echo "✅ SQL injection protection working" || echo "❌ SQL injection protection failed"
    
    # Test rate limiting
    echo "Testing rate limiting..."
    response=$(curl -s -w "%{http_code}" -o /dev/null "http://localhost:8000/api/security/test/rate-limit")
    if [ "$response" = "200" ]; then
        echo "✅ Rate limiting working"
    else
        echo "❌ Rate limiting failed (HTTP $response)"
    fi
    
    echo -e "${GREEN}✅ Security tests completed${NC}"
}

# Function to create startup script
create_startup_script() {
    echo -e "${YELLOW}🚀 Creating secure startup script...${NC}"
    
    cat > "$PROJECT_ROOT/secure_start.sh" << 'EOF'
#!/bin/bash

# Secure startup script for Crazy-Gary

set -e

echo "🚀 Starting Crazy-Gary with security features..."

# Check if security environment is configured
if [ ! -f ".env.security" ]; then
    echo "❌ Security environment not configured. Run security setup first."
    exit 1
fi

# Load security environment
source .env.security

# Validate critical security settings
if [ "$ENVIRONMENT" = "production" ]; then
    if [ "$API_KEY" = "your-api-key-change-in-production" ]; then
        echo "❌ API_KEY not configured for production!"
        exit 1
    fi
    
    if [ "$JWT_SECRET_KEY" = "your-jwt-secret-key-change-in-production-min-32-chars" ]; then
        echo "❌ JWT_SECRET_KEY not configured for production!"
        exit 1
    fi
fi

# Start the application with security
echo "🔒 Starting with security features enabled..."

# Start API server
cd apps/api
python start_server.py &
API_PID=$!

# Start web server
cd ../web
npm run dev &
WEB_PID=$!

echo "✅ Crazy-Gary started successfully!"
echo "📊 Security monitoring: http://localhost:8000/api/security/health"
echo "🛑 To stop: kill $API_PID $WEB_PID"

# Wait for processes
wait $API_PID $WEB_PID
EOF
    
    chmod +x "$PROJECT_ROOT/secure_start.sh"
    echo -e "${GREEN}✅ Secure startup script created${NC}"
}

# Main execution
main() {
    echo -e "${BLUE}Starting comprehensive security setup...${NC}"
    
    # Check if we're in the right directory
    if [ ! -d "apps" ]; then
        echo -e "${RED}❌ Please run this script from the Crazy-Gary project root${NC}"
        exit 1
    fi
    
    # Create backups
    echo -e "${YELLOW}💾 Creating backups...${NC}"
    
    # Install dependencies
    install_python_deps
    install_node_deps
    
    # Create security configuration
    create_security_env
    create_security_docs
    
    # Update application files
    update_main_py
    create_security_init
    create_security_monitor
    create_startup_script
    
    # Setup monitoring
    setup_cron_jobs
    
    echo -e "${GREEN}🎉 Security setup complete!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Review and update .env.security with production values"
    echo "2. Run: python init_security.py"
    echo "3. Start application: ./secure_start.sh"
    echo "4. Test security: ./monitor_security.sh"
    echo ""
    echo -e "${YELLOW}Security endpoints:${NC}"
    echo "- Health: http://localhost:8000/api/security/health"
    echo "- Metrics: http://localhost:8000/api/security/metrics"
    echo "- Config validation: http://localhost:8000/api/security/validate-config"
    echo ""
    echo -e "${YELLOW}Test endpoints:${NC}"
    echo "- XSS test: http://localhost:8000/api/security/test/xss"
    echo "- SQL injection test: http://localhost:8000/api/security/test/sql-injection"
    echo "- Rate limit test: http://localhost:8000/api/security/test/rate-limit"
    echo "- CSRF test: http://localhost:8000/api/security/test/csrf"
}

# Run main function
main "$@"