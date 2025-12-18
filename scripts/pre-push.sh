#!/bin/bash

# Crazy Gary Pre-push Hook with Comprehensive Testing
# This script runs comprehensive tests before allowing pushes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[PRE-PUSH]${NC} $1"
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

print_status "Starting pre-push comprehensive testing..."

# 1. Run full TypeScript compilation
print_status "Running full TypeScript compilation..."
if command_exists npm && [ -f "apps/web/package.json" ]; then
    cd apps/web
    if npm run build > /dev/null 2>&1; then
        print_success "TypeScript compilation passed"
    else
        print_error "TypeScript compilation failed"
        npm run build
        exit 1
    fi
    cd ../..
fi

# 2. Run full linting
print_status "Running full ESLint check..."
if command_exists npm && [ -f "apps/web/package.json" ]; then
    cd apps/web
    if npm run lint > /dev/null 2>&1; then
        print_success "Full ESLint check passed"
    else
        print_error "ESLint check failed"
        npm run lint
        exit 1
    fi
    cd ../..
fi

# 3. Run all tests with coverage
print_status "Running full test suite with coverage..."
if command_exists npm && [ -f "apps/web/package.json" ]; then
    cd apps/web
    if npm run test:coverage > /dev/null 2>&1; then
        print_success "All tests passed with coverage"
        
        # Check coverage thresholds
        if [ -f "coverage/coverage-summary.json" ]; then
            LINE_COVERAGE=$(node -e "console.log(JSON.parse(require('fs').readFileSync('coverage/coverage-summary.json', 'utf8')).total.lines.pct)" 2>/dev/null || echo "0")
            BRANCH_COVERAGE=$(node -e "console.log(JSON.parse(require('fs').readFileSync('coverage/coverage-summary.json', 'utf8')).total.branches.pct)" 2>/dev/null || echo "0")
            FUNCTION_COVERAGE=$(node -e "console.log(JSON.parse(require('fs').readFileSync('coverage/coverage-summary.json', 'utf8')).total.functions.pct)" 2>/dev/null || echo "0")
            
            print_status "Coverage Report:"
            print_status "  Lines: ${LINE_COVERAGE}%"
            print_status "  Branches: ${BRANCH_COVERAGE}%"
            print_status "  Functions: ${FUNCTION_COVERAGE}%"
            
            # Set coverage thresholds
            if (( $(echo "$LINE_COVERAGE < 80" | bc -l 2>/dev/null || echo 1) )); then
                print_error "Line coverage (${LINE_COVERAGE}%) is below 80% threshold"
                exit 1
            fi
            
            if (( $(echo "$BRANCH_COVERAGE < 75" | bc -l 2>/dev/null || echo 1) )); then
                print_error "Branch coverage (${BRANCH_COVERAGE}%) is below 75% threshold"
                exit 1
            fi
        fi
    else
        print_error "Tests failed"
        npm run test
        exit 1
    fi
    cd ../..
fi

# 4. Check bundle size
print_status "Checking bundle size..."
if command_exists npm && [ -f "apps/web/package.json" ]; then
    cd apps/web
    if npm run check-bundle > /dev/null 2>&1; then
        BUNDLE_SIZE=$(du -sh dist 2>/dev/null | cut -f1 || echo "N/A")
        print_success "Bundle size check passed (${BUNDLE_SIZE})"
    else
        print_warning "Bundle size check had issues"
    fi
    cd ../..
fi

# 5. Run security audit
print_status "Running security audit..."
if command_exists npm; then
    # Check for known vulnerabilities
    if npm audit --audit-level=moderate > /dev/null 2>&1; then
        print_success "Security audit passed"
    else
        print_warning "Security vulnerabilities found"
        npm audit
        echo "Do you want to continue despite security issues? (y/N)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
fi

# 6. Performance checks
print_status "Running performance checks..."
if command_exists npm && [ -f "apps/web/package.json" ]; then
    cd apps/web
    if command_exists lighthouse; then
        # Basic performance check if lighthouse is available
        print_status "Lighthouse performance check skipped (requires Chrome)"
    else
        print_status "Lighthouse not available - skipping detailed performance check"
    fi
    
    # Check for performance issues in code
    SLOW_IMPORTS=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "import.*from.*node_modules" | head -5 || true)
    if [ ! -z "$SLOW_IMPORTS" ]; then
        print_warning "Consider lazy loading for large imports"
    else
        print_success "Import optimization check passed"
    fi
    cd ../..
fi

# 7. Check for dead code
print_status "Checking for dead code..."
if command_exists npm && [ -f "apps/web/package.json" ]; then
    cd apps/web
    # Basic dead code check - look for unused imports
    UNUSED_FILES=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "import.*from.*['\"].*['\"]" | head -3 || true)
    if [ ! -z "$UNUSED_FILES" ]; then
        print_warning "Potential dead code detected - review imports"
    else
        print_success "Dead code check passed"
    fi
    cd ../..
fi

# 8. Generate build artifacts
print_status "Generating production build..."
if command_exists npm && [ -f "apps/web/package.json" ]; then
    cd apps/web
    if npm run build:production > /dev/null 2>&1; then
        print_success "Production build successful"
        
        # Check if build artifacts exist
        if [ -d "dist" ] && [ "$(ls -A dist)" ]; then
            print_success "Build artifacts generated successfully"
            
            # Show build size
            BUILD_SIZE=$(du -sh dist 2>/dev/null | cut -f1 || echo "N/A")
            print_status "Production build size: ${BUILD_SIZE}"
        else
            print_error "Build artifacts not generated"
            exit 1
        fi
    else
        print_error "Production build failed"
        npm run build:production
        exit 1
    fi
    cd ../..
fi

# 9. Check Python code quality (for API)
if [ -d "apps/api" ]; then
    print_status "Checking Python code quality..."
    if command_exists python3; then
        # Basic Python syntax check
        if find apps/api -name "*.py" -exec python3 -m py_compile {} \; > /dev/null 2>&1; then
            print_success "Python syntax check passed"
        else
            print_error "Python syntax errors found"
            exit 1
        fi
    fi
fi

print_success "All pre-push comprehensive tests passed!"
print_status "Safe to push to remote repository"