#!/bin/bash

# Crazy Gary Pre-commit Hook with Quality Gates
# This script runs comprehensive quality checks before allowing commits

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[QUALITY GATE]${NC} $1"
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

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)
echo "[PRE-COMMIT] Staged files: $STAGED_FILES"

# Exit if no files are staged
if [ -z "$STAGED_FILES" ]; then
    print_warning "No files staged for commit"
    exit 0
fi

print_status "Starting pre-commit quality gates..."

# 1. Check for TypeScript compilation errors
print_status "Checking TypeScript compilation..."
if command_exists npm && [ -f "apps/web/package.json" ]; then
    cd apps/web
    if npm run type-check > /dev/null 2>&1; then
        print_success "TypeScript compilation passed"
    else
        print_error "TypeScript compilation failed"
        npm run type-check
        exit 1
    fi
    cd ../..
fi

# 2. Run ESLint on staged files
print_status "Running ESLint on staged files..."
if command_exists eslint && [ -f ".eslintrc.json" ]; then
    if echo "$STAGED_FILES" | grep -E '\.(ts|tsx|js|jsx)$' | xargs eslint --ext .ts,.tsx,.js,.jsx --max-warnings 0 2>/dev/null; then
        print_success "ESLint passed"
    else
        print_error "ESLint failed. Run 'npm run lint:fix' to fix issues."
        exit 1
    fi
fi

# 3. Check Prettier formatting
print_status "Checking Prettier formatting..."
if command_exists prettier && [ -f ".prettierrc.json" ]; then
    FORMATTED_FILES=$(echo "$STAGED_FILES" | grep -E '\.(ts|tsx|js|jsx|json|css|md|yml|yaml)$' || true)
    if [ ! -z "$FORMATTED_FILES" ]; then
        if echo "$FORMATTED_FILES" | xargs prettier --check --ignore-unknown 2>/dev/null; then
            print_success "Prettier formatting check passed"
        else
            print_error "Code formatting issues found. Run 'npm run format' to fix."
            exit 1
        fi
    fi
fi

# 4. Run unit tests (only if test files are changed)
print_status "Checking if tests need to be run..."
TEST_CHANGED=false
for file in $STAGED_FILES; do
    if [[ $file == *".test."* ]] || [[ $file == *".spec."* ]] || [[ $file == *"/__tests__/"* ]]; then
        TEST_CHANGED=true
        break
    fi
done

if [ "$TEST_CHANGED" = true ] && command_exists npm && [ -f "apps/web/package.json" ]; then
    print_status "Running unit tests..."
    cd apps/web
    if npm test -- --run --reporter=verbose > /dev/null 2>&1; then
        print_success "Unit tests passed"
    else
        print_error "Unit tests failed"
        npm test -- --run
        exit 1
    fi
    cd ../..
fi

# 5. Check for security vulnerabilities (basic checks)
print_status "Running security checks..."
if command_exists npm; then
    # Check for common security issues in staged files
    SECURITY_ISSUES=false
    
    # Check for console.log statements
    if echo "$STAGED_FILES" | grep -E '\.(ts|tsx|js|jsx)$' | xargs grep -l "console\.log\|console\.error\|console\.warn" 2>/dev/null; then
        print_warning "Console statements found in code"
        SECURITY_ISSUES=true
    fi
    
    # Check for TODO/FIXME comments in new code
    if echo "$STAGED_FILES" | grep -E '\.(ts|tsx|js|jsx)$' | xargs grep -l "TODO\|FIXME" 2>/dev/null; then
        print_warning "TODO/FIXME comments found - consider addressing these"
    fi
    
    # Check for hardcoded secrets/keys
    if echo "$STAGED_FILES" | grep -E '\.(ts|tsx|js|jsx|json|env)$' | xargs grep -i -E "(password|secret|key|token).*=\s*['\"][^'\"]+['\"]" 2>/dev/null; then
        print_error "Potential hardcoded secrets found!"
        exit 1
    fi
    
    if [ "$SECURITY_ISSUES" = true ]; then
        print_warning "Security issues detected - please review"
    else
        print_success "Basic security checks passed"
    fi
fi

# 6. Check code complexity (basic check)
print_status "Checking code complexity..."
if command_exists npm && [ -f "apps/web/package.json" ]; then
    cd apps/web
    # Simple complexity check - look for deeply nested functions
    COMPLEX_FILES=$(echo "$STAGED_FILES" | grep -E '\.(ts|tsx)$' || true)
    if [ ! -z "$COMPLEX_FILES" ]; then
        HIGH_COMPLEXITY=false
        for file in $COMPLEX_FILES; do
            if [ -f "$file" ]; then
                # Check for functions with more than 3 nested blocks
                NESTING_LEVEL=$(grep -o '{\s*' "$file" | wc -l || echo 0)
                if [ "$NESTING_LEVEL" -gt 20 ]; then
                    print_warning "High nesting complexity detected in $file"
                    HIGH_COMPLEXITY=true
                fi
            fi
        done
        
        if [ "$HIGH_COMPLEXITY" = true ]; then
            print_warning "High complexity code detected - consider refactoring"
        else
            print_success "Code complexity check passed"
        fi
    fi
    cd ../..
fi

# 7. Check file sizes
print_status "Checking file sizes..."
LARGE_FILES=false
for file in $STAGED_FILES; do
    if [ -f "$file" ]; then
        FILE_SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
        if [ "$FILE_SIZE" -gt 50000 ]; then  # 50KB
            print_warning "Large file detected: $file ($(($FILE_SIZE / 1024))KB)"
            LARGE_FILES=true
        fi
    fi
done

if [ "$LARGE_FILES" = false ]; then
    print_success "File size check passed"
fi

# 8. Generate test coverage report if tests were run
if [ "$TEST_CHANGED" = true ] && command_exists npm && [ -f "apps/web/package.json" ]; then
    print_status "Generating test coverage report..."
    cd apps/web
    if npm run test:coverage > /dev/null 2>&1; then
        print_success "Test coverage report generated"
        # Show coverage summary if available
        if [ -f "coverage/coverage-summary.json" ]; then
            COVERAGE=$(node -e "console.log(JSON.parse(require('fs').readFileSync('coverage/coverage-summary.json', 'utf8')).total.lines.pct)" 2>/dev/null || echo "N/A")
            print_status "Line coverage: ${COVERAGE}%"
        fi
    fi
    cd ../..
fi

# 9. Auto-format files if needed
print_status "Auto-formatting files..."
if command_exists prettier && [ -f ".prettierrc.json" ]; then
    FORMATTABLE_FILES=$(echo "$STAGED_FILES" | grep -E '\.(ts|tsx|js|jsx|json|css|md|yml|yaml)$' || true)
    if [ ! -z "$FORMATTABLE_FILES" ]; then
        echo "$FORMATTABLE_FILES" | xargs prettier --write --ignore-unknown 2>/dev/null || true
        git add $(echo "$STAGED_FILES" | grep -E '\.(ts|tsx|js|jsx|json|css|md|yml|yaml)$' || true) 2>/dev/null || true
        print_success "Auto-formatting completed"
    fi
fi

print_success "All pre-commit quality gates passed!"
print_status "Proceeding with commit..."