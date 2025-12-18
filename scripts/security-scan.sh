#!/bin/bash

# Crazy Gary Security Scan Script
# Performs comprehensive security checks on the codebase

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[SECURITY]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

print_status "Starting comprehensive security scan..."

# 1. Check for hardcoded secrets
print_status "Checking for hardcoded secrets..."
SECRETS_FOUND=false

# Common patterns for secrets
SECRET_PATTERNS=(
    "password\s*=\s*['\"][^'\"]+['\"]"
    "secret\s*=\s*['\"][^'\"]+['\"]"
    "key\s*=\s*['\"][^'\"]+['\"]"
    "token\s*=\s*['\"][^'\"]+['\"]"
    "api_key\s*=\s*['\"][^'\"]+['\"]"
    "private_key\s*=\s*['\"][^'\"]+['\"]"
    "auth_token\s*=\s*['\"][^'\"]+['\"]"
    "access_token\s*=\s*['\"][^'\"]+['\"]"
)

for pattern in "${SECRET_PATTERNS[@]}"; do
    if grep -riE "$pattern" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.py" src/ apps/ packages/ 2>/dev/null; then
        print_error "Potential hardcoded secret found matching pattern: $pattern"
        SECRETS_FOUND=true
    fi
done

if [ "$SECRETS_FOUND" = false ]; then
    print_success "No hardcoded secrets detected"
fi

# 2. Check for SQL injection vulnerabilities
print_status "Checking for SQL injection vulnerabilities..."
SQL_INJECTION_PATTERNS=(
    "execute\s*\(\s*['\"].*\+.*['\"]"
    "query\s*\(\s*['\"].*\+.*['\"]"
    "cursor\.execute\s*\(\s*['\"].*\+.*['\"]"
)

for pattern in "${SQL_INJECTION_PATTERNS[@]}"; do
    if grep -riE "$pattern" --include="*.py" --include="*.ts" --include="*.js" src/ apps/ 2>/dev/null; then
        print_warning "Potential SQL injection vulnerability: $pattern"
    fi
done

# 3. Check for XSS vulnerabilities
print_status "Checking for XSS vulnerabilities..."
XSS_PATTERNS=(
    "innerHTML\s*="
    "outerHTML\s*="
    "document\.write\s*\("
    "eval\s*\("
    "setTimeout\s*\(\s*['\"]"
)

for pattern in "${XSS_PATTERNS[@]}"; do
    if grep -riE "$pattern" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/ apps/web/ 2>/dev/null; then
        print_warning "Potential XSS vulnerability: $pattern"
    fi
done

# 4. Check for insecure HTTP usage
print_status "Checking for insecure HTTP usage..."
if grep -ri "http://" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.json" src/ apps/ 2>/dev/null; then
    print_warning "Insecure HTTP URLs found (consider using HTTPS)"
else
    print_success "No insecure HTTP URLs found"
fi

# 5. Check for insecure random number generation
print_status "Checking for insecure random number generation..."
if grep -ri "Math\.random" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/ apps/web/ 2>/dev/null; then
    print_warning "Insecure random number generation detected (consider using crypto.randomBytes)"
fi

# 6. Check for insecure file operations
print_status "Checking for insecure file operations..."
if grep -ri "fs\.readFileSync\s*\(\s*['\"]\.\./" --include="*.ts" --include="*.js" --include="*.py" src/ apps/ 2>/dev/null; then
    print_warning "Potential path traversal vulnerability detected"
fi

# 7. Check for missing security headers (in configuration files)
print_status "Checking security headers..."
if [ -f "apps/web/vite.config.ts" ]; then
    if grep -q "Content-Security-Policy" apps/web/vite.config.ts 2>/dev/null; then
        print_success "CSP header configuration found"
    else
        print_warning "Content Security Policy not configured"
    fi
fi

# 8. Check for exposed sensitive files
print_status "Checking for exposed sensitive files..."
SENSITIVE_FILES=(
    ".env"
    ".env.local"
    ".env.production"
    "config.json"
    "secrets.json"
    "*.key"
    "*.pem"
    "id_rsa"
    "id_dsa"
)

for pattern in "${SENSITIVE_FILES[@]}"; do
    if find . -name "$pattern" -not -path "./.git/*" 2>/dev/null; then
        print_warning "Potentially sensitive file found: $pattern"
    fi
done

# 9. Check dependency vulnerabilities
print_status "Checking dependency vulnerabilities..."
if command_exists npm; then
    if npm audit --audit-level=moderate > /dev/null 2>&1; then
        print_success "No moderate or high severity vulnerabilities found"
    else
        print_warning "Vulnerabilities found in dependencies:"
        npm audit --audit-level=moderate
    fi
fi

# 10. Check for outdated dependencies with known vulnerabilities
print_status "Checking for outdated dependencies..."
if command_exists npm; then
    OUTDATED=$(npm outdated --depth=0 2>/dev/null || echo "")
    if [ ! -z "$OUTDATED" ]; then
        print_warning "Some dependencies are outdated:"
        echo "$OUTDATED"
    else
        print_success "All dependencies are up to date"
    fi
fi

print_status "Security scan completed!"
print_status "Review any warnings above and address security concerns before deploying."