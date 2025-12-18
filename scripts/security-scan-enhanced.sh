#!/bin/bash

# Crazy Gary Enhanced Security Scanner
# Comprehensive security checks for the entire codebase

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

# Load security configuration
SECURITY_CONFIG=".quality-gates.json"
if [ -f "$SECURITY_CONFIG" ]; then
    AUDIT_LEVEL=$(node -e "console.log(require('./$SECURITY_CONFIG').security.auditLevel)" 2>/dev/null || echo "moderate")
    BLOCK_HIGH=$(node -e "console.log(require('./$SECURITY_CONFIG').security.blockOnHighSeverity)" 2>/dev/null || echo "true")
    BLOCK_MODERATE=$(node -e "console.log(require('./$SECURITY_CONFIG').security.blockOnModerateSeverity)" 2>/dev/null || echo "false")
else
    AUDIT_LEVEL="moderate"
    BLOCK_HIGH="true"
    BLOCK_MODERATE="false"
fi

print_status "Starting enhanced security scan..."

# 1. Hardcoded secrets detection
print_status "Scanning for hardcoded secrets..."
SECRETS_FOUND=false

# Enhanced patterns for secrets detection
SECRET_PATTERNS=(
    # API Keys and tokens
    "api[_-]?key\s*=\s*['\"][^'\"]{20,}['\"]"
    "secret[_-]?key\s*=\s*['\"][^'\"]{20,}['\"]"
    "access[_-]?token\s*=\s*['\"][^'\"]{20,}['\"]"
    "auth[_-]?token\s*=\s*['\"][^'\"]{20,}['\"]"
    "private[_-]?key\s*=\s*['\"][^'\"]{20,}['\"]"
    "bearer\s+[A-Za-z0-9\-\._~\+\/]+=*"
    
    # Database credentials
    "password\s*=\s*['\"][^'\"]{6,}['\"]"
    "db[_-]?password\s*=\s*['\"][^'\"]{6,}['\"]"
    "database[_-]?password\s*=\s*['\"][^'\"]{6,}['\"]"
    
    # AWS credentials
    "aws[_-]?secret[_-]?access[_-]?key\s*=\s*['\"][^'\"]{20,}['\"]"
    "aws[_-]?access[_-]?key[_-]?id\s*=\s*['\"][A-Z0-9]{16,}['\"]"
    
    # GitHub tokens
    "ghp_[A-Za-z0-9]{36}"
    "github[_-]?token\s*=\s*['\"][A-Za-z0-9]{36}['\"]"
    
    # JWT tokens
    "jwt[_-]?secret\s*=\s*['\"][^'\"]{20,}['\"]"
    "jsonwebtoken[_-]?secret\s*=\s*['\"][^'\"]{20,}['\"]"
    
    # Generic secret patterns
    "secret\s*=\s*['\"][^'\"]{10,}['\"]"
    "token\s*=\s*['\"][^'\"]{10,}['\"]"
    "key\s*=\s*['\"][^'\"]{10,}['\"]"
)

for pattern in "${SECRET_PATTERNS[@]}"; do
    if grep -riE "$pattern" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.py" --include="*.env*" src/ apps/ packages/ 2>/dev/null; then
        print_error "Potential hardcoded secret found matching pattern: $pattern"
        SECRETS_FOUND=true
    fi
done

if [ "$SECRETS_FOUND" = false ]; then
    print_success "No hardcoded secrets detected"
fi

# 2. SQL Injection vulnerabilities
print_status "Checking for SQL injection vulnerabilities..."
SQL_INJECTION_PATTERNS=(
    "execute\s*\(\s*['\"].*\+.*['\"]"
    "query\s*\(\s*['\"].*\+.*['\"]"
    "cursor\.execute\s*\(\s*['\"].*\+.*['\"]"
    "db\.execute\s*\(\s*['\"].*\+.*['\"]"
    "connection\.execute\s*\(\s*['\"].*\+.*['\"]"
    "SELECT\s+.*FROM\s+.*\+\s*"
    "INSERT\s+INTO\s+.*\+\s*"
    "UPDATE\s+.*SET\s+.*\+\s*"
    "DELETE\s+FROM\s+.*\+\s*"
)

SQL_ISSUES=false
for pattern in "${SQL_INJECTION_PATTERNS[@]}"; do
    if grep -riE "$pattern" --include="*.py" --include="*.ts" --include="*.js" src/ apps/ 2>/dev/null; then
        print_warning "Potential SQL injection vulnerability: $pattern"
        SQL_ISSUES=true
    fi
done

if [ "$SQL_ISSUES" = false ]; then
    print_success "No SQL injection patterns detected"
fi

# 3. XSS vulnerabilities
print_status "Checking for XSS vulnerabilities..."
XSS_PATTERNS=(
    "innerHTML\s*="
    "outerHTML\s*="
    "document\.write\s*\("
    "eval\s*\("
    "setTimeout\s*\(\s*['\"]"
    "setInterval\s*\(\s*['\"]"
    "dangerouslySetInnerHTML"
    "\.html\s*\("
    "insertAdjacentHTML"
)

XSS_ISSUES=false
for pattern in "${XSS_PATTERNS[@]}"; do
    if grep -riE "$pattern" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/ apps/web/ 2>/dev/null; then
        print_warning "Potential XSS vulnerability: $pattern"
        XSS_ISSUES=true
    fi
done

if [ "$XSS_ISSUES" = false ]; then
    print_success "No XSS patterns detected"
fi

# 4. Insecure HTTP usage
print_status "Checking for insecure HTTP usage..."
HTTP_ISSUES=false
if grep -ri "http://" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.json" --include="*.md" src/ apps/ 2>/dev/null; then
    print_warning "Insecure HTTP URLs found (consider using HTTPS)"
    HTTP_ISSUES=true
else
    print_success "No insecure HTTP URLs found"
fi

# 5. Insecure random number generation
print_status "Checking for insecure random number generation..."
RANDOM_ISSUES=false
if grep -ri "Math\.random" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/ apps/web/ 2>/dev/null; then
    print_warning "Insecure random number generation detected (consider using crypto.randomBytes)"
    RANDOM_ISSUES=true
else
    print_success "No insecure random generation detected"
fi

# 6. Insecure file operations
print_status "Checking for insecure file operations..."
FILE_ISSUES=false
if grep -ri "fs\.readFileSync\s*\(\s*['\"]\.\./" --include="*.ts" --include="*.js" --include="*.py" src/ apps/ 2>/dev/null; then
    print_warning "Potential path traversal vulnerability detected"
    FILE_ISSUES=true
else
    print_success "No path traversal vulnerabilities detected"
fi

# 7. Command injection vulnerabilities
print_status "Checking for command injection vulnerabilities..."
CMD_INJECTION_PATTERNS=(
    "exec\s*\(\s*.*\+"
    "spawn\s*\(\s*.*\+"
    "child_process\.(exec|spawn).*\+"
    "os\.system\s*\("
    "subprocess\.call\s*\(\s*.*\+"
)

CMD_ISSUES=false
for pattern in "${CMD_INJECTION_PATTERNS[@]}"; do
    if grep -riE "$pattern" --include="*.py" --include="*.ts" --include="*.js" src/ apps/ 2>/dev/null; then
        print_warning "Potential command injection vulnerability: $pattern"
        CMD_ISSUES=true
    fi
done

if [ "$CMD_ISSUES" = false ]; then
    print_success "No command injection patterns detected"
fi

# 8. Security headers validation
print_status "Validating security headers..."
if [ -f "apps/web/vite.config.ts" ]; then
    if grep -q "Content-Security-Policy" apps/web/vite.config.ts 2>/dev/null; then
        print_success "CSP header configuration found"
    else
        print_warning "Content Security Policy not configured"
    fi
    
    if grep -q "X-Frame-Options" apps/web/vite.config.ts 2>/dev/null; then
        print_success "X-Frame-Options header configured"
    else
        print_warning "X-Frame-Options header not configured"
    fi
    
    if grep -q "X-Content-Type-Options" apps/web/vite.config.ts 2>/dev/null; then
        print_success "X-Content-Type-Options header configured"
    else
        print_warning "X-Content-Type-Options header not configured"
    fi
fi

# 9. Exposed sensitive files
print_status "Checking for exposed sensitive files..."
SENSITIVE_FILES=(
    ".env"
    ".env.local"
    ".env.production"
    ".env.development"
    "config.json"
    "secrets.json"
    "*.key"
    "*.pem"
    "id_rsa"
    "id_dsa"
    "*.p12"
    "*.pfx"
    "*.jks"
    "*.keystore"
    "*.truststore"
    "web.config"
    ".htaccess"
    "*.htpasswd"
)

SENSITIVE_FOUND=false
for pattern in "${SENSITIVE_FILES[@]}"; do
    if find . -name "$pattern" -not -path "./.git/*" -not -path "./node_modules/*" 2>/dev/null; then
        print_warning "Potentially sensitive file found: $pattern"
        SENSITIVE_FOUND=true
    fi
done

if [ "$SENSITIVE_FOUND" = false ]; then
    print_success "No exposed sensitive files found"
fi

# 10. Dependency vulnerabilities
print_status "Checking dependency vulnerabilities..."
if command_exists npm; then
    AUDIT_OUTPUT=$(npm audit --audit-level="$AUDIT_LEVEL" 2>&1 || echo "")
    
    if echo "$AUDIT_OUTPUT" | grep -q "found.*vulnerabilities"; then
        HIGH_VULN=$(echo "$AUDIT_OUTPUT" | grep -o "[0-9]* high severity" | grep -o "[0-9]*" || echo "0")
        MOD_VULN=$(echo "$AUDIT_OUTPUT" | grep -o "[0-9]* moderate severity" | grep -o "[0-9]*" || echo "0")
        LOW_VULN=$(echo "$AUDIT_OUTPUT" | grep -o "[0-9]* low severity" | grep -o "[0-9]*" || echo "0")
        
        print_error "Dependency vulnerabilities found:"
        echo "$AUDIT_OUTPUT"
        
        if [ "$HIGH_VULN" -gt 0 ] && [ "$BLOCK_HIGH" = "true" ]; then
            print_error "High severity vulnerabilities detected - blocking deployment"
            exit 1
        elif [ "$MOD_VULN" -gt 0 ] && [ "$BLOCK_MODERATE" = "true" ]; then
            print_error "Moderate severity vulnerabilities detected - blocking deployment"
            exit 1
        else
            print_warning "Vulnerabilities found but not blocking (check configuration)"
        fi
    else
        print_success "No $AUDIT_LEVEL or higher vulnerabilities found"
    fi
fi

# 11. Outdated dependencies
print_status "Checking for outdated dependencies..."
if command_exists npm; then
    OUTDATED=$(npm outdated --depth=0 2>/dev/null || echo "")
    if [ ! -z "$OUTDATED" ]; then
        print_warning "Some dependencies are outdated:"
        echo "$OUTDATED" | head -10
    else
        print_success "All dependencies are up to date"
    fi
fi

# 12. Package.json security analysis
print_status "Analyzing package.json for security issues..."
if [ -f "package.json" ]; then
    # Check for scripts that might execute malicious code
    if grep -q '"scripts".*"preinstall".*"curl\|wget\|nc\|netcat"' package.json 2>/dev/null; then
        print_warning "Potential security issue: curl/wget in preinstall script"
    fi
    
    # Check for dangerous dependencies
    DANGEROUS_DEPS=("eval" "child_process" "fs" "os")
    for dep in "${DANGEROUS_DEPS[@]}"; do
        if grep -q "\"$dep\"" package.json 2>/dev/null; then
            print_warning "Potentially dangerous dependency: $dep"
        fi
    done
fi

# 13. CORS configuration
print_status "Checking CORS configuration..."
if grep -ri "cors" --include="*.ts" --include="*.js" --include="*.json" src/ apps/ 2>/dev/null; then
    if grep -ri "origin.*\*" --include="*.ts" --include="*.js" src/ apps/ 2>/dev/null; then
        print_warning "CORS configured with wildcard origin - ensure this is intentional"
    else
        print_success "CORS configuration appears secure"
    fi
fi

# 14. Rate limiting
print_status "Checking for rate limiting implementation..."
if grep -ri "rate.*limit\|throttle\|debounce" --include="*.ts" --include="*.js" --include="*.py" src/ apps/ 2>/dev/null; then
    print_success "Rate limiting patterns detected"
else
    print_warning "No rate limiting patterns detected - consider implementing"
fi

print_status "Enhanced security scan completed!"
print_status "Review any warnings above and address security concerns before deploying."

# Summary
TOTAL_ISSUES=$((SECRETS_FOUND + SQL_ISSUES + XSS_ISSUES + HTTP_ISSUES + RANDOM_ISSUES + FILE_ISSUES + CMD_ISSUES + SENSITIVE_FOUND))
if [ $TOTAL_ISSUES -eq 0 ]; then
    print_success "Security scan completed - No critical issues found"
    exit 0
else
    print_warning "Security scan completed - $TOTAL_ISSUES potential issues found"
    exit 1
fi